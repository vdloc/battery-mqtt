import { faker } from "@faker-js/faker"
import { OPERATORS, Topic } from "../types/Topic"
import { mqttService, MqttService } from "./mqtt"
import { databaseService, DevicesFromDB, DeviceIntervalsFromDB } from "./database"
import { BatteryStatusResponse } from "../types/Response"
import { log } from "./log"

enum ISP {
  VNPT = "VNPT",
  VTC = "VTC",
  MOBIFONE = "MOBIFONE",
  VIETTEL = "VIETTEL",
  GMOBILE = "GMOBILE",
  FPT = "FPT",
}

interface Task {
  imei: string
  tasks: {
    battery: NodeJS.Timeout | null
    gateway: NodeJS.Timeout | null
    downtrend: NodeJS.Timeout | null
  }
  lastBatteryStatus: BatteryStatusResponse | null
  downtrendDuration: number
  uptrendDuration: number
  normalizeDuration: number
  downtrendInterval: number
  downtrendAmpereLimit: number
  downtrendVoltageLimit: number
  uptrendAmpereLimit: number
  uptrendVoltageLimit: number
  normalizeAmpereLimit: number
  normalizeVoltageLimit: number
  isDownTrend: boolean
  isUpTrend: boolean
  isNormalize: boolean
  batteryStatusInterval: number
}

export class CronJobService {
  devices: DevicesFromDB
  tasks: Task[]
  mqttService: MqttService = mqttService
  private readonly ampereRange: [number, number] = [0, 1]
  private readonly voltageRange: [number, number] = [53, 54]
  private readonly downtrendDurationRange: [number, number] = [5, 7]
  private readonly uptrendDurationRange: [number, number] = [2, 3]
  private readonly normalizeDurationRange: [number, number] = [2, 3]
  private readonly downtrendIntervalRange: [number, number] = [10, 15]
  private readonly downtrendAmpereRange: [number, number] = [-30, -20]
  private readonly uptrendAmpereRange: [number, number] = [30, 40]
  private readonly uptrendVoltageRange: [number, number] = [53, 53]
  private readonly downtrendVoltageRange: [number, number] = [43, 45]

  constructor() {
    this.devices = []
    this.tasks = []
  }

  async init() {
    this.devices = await databaseService.getDevices(undefined)
    let intervals = await databaseService.getDevicesInterval(this.devices)
    this.tasks = this.sendFakeStatus(intervals)
  }

  createFakeBatteryStatusResponse(imei: string, taskData: Task): BatteryStatusResponse {
    let infor = this.getRandomInfor()

    if (taskData.lastBatteryStatus) {
      if (taskData.isDownTrend) {
        infor = this.getDowntrendInfor(taskData)
      }

      if (taskData.isUpTrend) {
        infor = this.getUptrendInfor(taskData)
      }

      if (taskData.isNormalize) {
        infor = this.getNormalizeInfor(taskData)
      }
    }

    return {
      imei,
      operator: OPERATORS.SEND_BATTERY_STATUS,
      infor,
      time: this.getRandomTime(),
    }
  }

  async createFakeGatewayStatusResponse(imei: string) {
    let channel = await databaseService.getSetupChannel(imei)
    return {
      imei,
      operator: OPERATORS.SEND_GATEWAY_STATUS,
      info: {
        operator: this.getRandomISP(),
        RSSI: this.getRandomInRange(30.15, 90.54),
        IP: this.getRandomIp(),
        usingChannel: channel ? channel : this.getRandomChannel(),
        fwVersion: 1.0,
      },
      time: `${this.getRandomTime()}`,
    }
  }

  sendFakeStatus(intervals: DeviceIntervalsFromDB): Task[] {
    if (!this.mqttService) return []

    return intervals.filter(Boolean).map((status) => {
      const { imei, batteryStatusInterval, deviceStatusInterval } = status
      const taskData: Task = {
        imei,
        tasks: {
          battery: null,
          gateway: null,
          downtrend: null,
        },
        lastBatteryStatus: null,
        // Random durations and limits for downtrend, uptrend, and normalization
        downtrendDuration: this.getRandomDurationInSecond(...this.downtrendDurationRange),
        uptrendDuration: this.getRandomDurationInSecond(...this.uptrendDurationRange),
        normalizeDuration: this.getRandomDurationInSecond(...this.normalizeDurationRange),
        // Random intervals and limits for downtrend and uptrend
        downtrendInterval: this.getRandomDurationInSecond(...this.downtrendIntervalRange),
        downtrendAmpereLimit: this.getRandomInRange(...this.downtrendAmpereRange),
        downtrendVoltageLimit: this.getRandomInRange(...this.downtrendVoltageRange),
        // Random limits for uptrend
        uptrendAmpereLimit: this.getRandomInRange(...this.uptrendAmpereRange),
        uptrendVoltageLimit: this.getRandomInRange(...this.uptrendVoltageRange),
        // Random limits for normalization
        normalizeAmpereLimit: this.getRandomInRange(...this.ampereRange),
        normalizeVoltageLimit: this.getRandomInRange(...this.voltageRange),
        isDownTrend: false,
        isUpTrend: false,
        isNormalize: false,
        batteryStatusInterval,
      }

      const batteryStatusCronTask = CronJobService.schedule(batteryStatusInterval, () => {
        const batteryStatus = this.createFakeBatteryStatusResponse(imei, taskData)
        const message = {
          topic: Topic.BATTERY_STATUS,
          message: this.createFakeBatteryStatusResponse(imei, taskData),
        }

        this.mqttService?.publish(message)
        taskData.lastBatteryStatus = batteryStatus
      })
      const gatewayStatusCronTask = CronJobService.schedule(deviceStatusInterval, async () => {
        const message = {
          topic: Topic.GATEWAY_STATUS,
          message: await this.createFakeGatewayStatusResponse(imei),
        }
        this.mqttService?.publish(message)
      })

      const downtrendCronHandler = () => {
        if (taskData.isDownTrend || taskData.isUpTrend) return
        taskData.isDownTrend = true
        taskData.isUpTrend = false
        taskData.isNormalize = false

        taskData.downtrendInterval = this.getRandomDurationInSecond(...this.downtrendIntervalRange)
        taskData.downtrendAmpereLimit = this.getRandomInRange(...this.downtrendAmpereRange)
        taskData.downtrendVoltageLimit = this.getRandomInRange(...this.downtrendVoltageRange)
        taskData.uptrendAmpereLimit = this.getRandomInRange(...this.uptrendAmpereRange)
        taskData.uptrendVoltageLimit = this.getRandomInRange(...this.uptrendVoltageRange)

        CronJobService.timeout(taskData.downtrendDuration, () => {
          taskData.isDownTrend = false
          taskData.isUpTrend = true

          CronJobService.timeout(taskData.uptrendDuration, () => {
            taskData.isDownTrend = false
            taskData.isUpTrend = false

            CronJobService.timeout(taskData.normalizeDuration, () => {
              taskData.isNormalize = true
              taskData.isUpTrend = false
              taskData.isDownTrend = false

              CronJobService.timeout(taskData.downtrendInterval, downtrendCronHandler)
            })
          })
        })
      }

      const downtrendCronTask = CronJobService.timeout(taskData.downtrendInterval, downtrendCronHandler)
      taskData.tasks.battery = batteryStatusCronTask
      taskData.tasks.gateway = gatewayStatusCronTask
      taskData.tasks.downtrend = downtrendCronTask

      return taskData
    })
  }

  getRandomInfor(): Record<string, { Voltage: number; Ampere: number }> {
    return {
      CH1: {
        Voltage: this.getRandomInRange(...this.voltageRange),
        Ampere: this.getRandomInRange(...this.ampereRange),
      },
      CH2: {
        Voltage: this.getRandomInRange(...this.voltageRange),
        Ampere: this.getRandomInRange(...this.ampereRange),
      },
      CH3: {
        Voltage: this.getRandomInRange(...this.voltageRange),
        Ampere: this.getRandomInRange(...this.ampereRange),
      },
      CH4: {
        Voltage: this.getRandomInRange(...this.voltageRange),
        Ampere: this.getRandomInRange(...this.ampereRange),
      },
    }
  }

  getDowntrendInfor(taskData: Task) {
    let { downtrendAmpereLimit, downtrendDuration, downtrendVoltageLimit, lastBatteryStatus, batteryStatusInterval } =
      taskData
    let lastInfor = structuredClone(lastBatteryStatus?.infor || {})
    let decreaseTime = batteryStatusInterval / downtrendDuration

    Object.keys(lastInfor ?? {}).forEach((channel) => {
      let decreaseAmpere = ((lastInfor?.[channel].Ampere || 0) - downtrendAmpereLimit) * decreaseTime
      let decreaseVoltage = ((lastInfor?.[channel].Voltage || 0) - downtrendVoltageLimit) * decreaseTime
      let channelInfor = lastInfor?.[channel as keyof typeof lastInfor]
      if (channelInfor) {
        channelInfor.Ampere = Math.max(channelInfor.Ampere - decreaseAmpere, downtrendAmpereLimit)
        channelInfor.Voltage = Math.max(channelInfor.Voltage - decreaseVoltage, downtrendVoltageLimit)
      }
    })

    return lastInfor
  }

  getUptrendInfor(taskData: Task) {
    let { uptrendAmpereLimit, uptrendDuration, uptrendVoltageLimit, lastBatteryStatus, batteryStatusInterval } =
      taskData
    let lastInfor = structuredClone(lastBatteryStatus?.infor || {})
    let decreaseTime = batteryStatusInterval / uptrendDuration

    Object.keys(lastInfor ?? {}).forEach((channel) => {
      let channelInfor = lastInfor?.[channel as keyof typeof lastInfor]

      let increaseAmpere = ((lastInfor?.[channel].Ampere || 0) - uptrendAmpereLimit) * decreaseTime
      let increaseVoltage = ((lastInfor?.[channel].Voltage || 0) - uptrendVoltageLimit) * decreaseTime

      if (channelInfor) {
        channelInfor.Ampere = Math.min(channelInfor.Ampere + increaseAmpere, uptrendAmpereLimit)
        channelInfor.Voltage = Math.min(channelInfor.Voltage + increaseVoltage, uptrendVoltageLimit)
      }
    })

    return lastInfor
  }

  getNormalizeInfor(taskData: Task) {
    let { normalizeDuration, lastBatteryStatus, batteryStatusInterval, normalizeAmpereLimit, normalizeVoltageLimit } =
      taskData
    let lastInfor = structuredClone(lastBatteryStatus?.infor || {})
    let decreaseTime = batteryStatusInterval / normalizeDuration

    Object.keys(lastInfor ?? {}).forEach((channel) => {
      let channelInfor = lastInfor?.[channel as keyof typeof lastInfor]

      let increaseAmpere = ((lastInfor?.[channel].Ampere || 0) - normalizeAmpereLimit) * decreaseTime
      let increaseVoltage = ((lastInfor?.[channel].Voltage || 0) - normalizeVoltageLimit) * decreaseTime

      if (channelInfor) {
        channelInfor.Ampere = Math.min(channelInfor.Ampere - increaseAmpere, normalizeAmpereLimit)
        channelInfor.Voltage = Math.min(channelInfor.Voltage - increaseVoltage, normalizeVoltageLimit)
      }
    })

    return lastInfor
  }

  getRandomInRange(min: number, max: number) {
    let randomValue = Math.random() * (max - min) + min
    return Number(randomValue.toFixed(2))
  }

  getRandomISP(): ISP {
    let keys = Object.keys(ISP)
    let randomKey = Math.floor(Math.random() * keys.length)

    return ISP[keys[randomKey] as keyof typeof ISP]
  }

  getRandomIp() {
    return Array.from({ length: 4 }, () => faker.number.int({ min: 1, max: 254 })).join(".")
  }

  getRandomChannel() {
    return Array.from({ length: 4 }, () => faker.number.int({ min: 0, max: 1 })).join("")
  }

  getRandomTime() {
    return Date.now() + Math.floor(Math.random() * 500)
  }

  getRandomDurationInMinutes(min: number, max: number) {
    return faker.number.int({ min: min * 60 * 1000, max: max * 60 * 1000 })
  }

  getRandomDurationInSecond(min: number, max: number) {
    return this.getRandomDurationInMinutes(min, max) / 1000
  }

  updateTask(imei: string, batteryStatusInterval: number, deviceStatusInterval: number) {
    let task = this.tasks.find((task) => task.imei === imei)

    if (task) {
      task.tasks.battery && clearInterval(task.tasks.battery)
      task.tasks.gateway && clearInterval(task.tasks.gateway)

      task.tasks.battery = CronJobService.schedule(batteryStatusInterval, () => {
        this.mqttService?.publish({
          topic: Topic.BATTERY_STATUS,
          message: this.createFakeBatteryStatusResponse(imei, task),
        })
      })
      task.tasks.gateway = CronJobService.schedule(deviceStatusInterval, () => {
        this.mqttService?.publish({ topic: Topic.GATEWAY_STATUS, message: this.createFakeGatewayStatusResponse(imei) })
      })
    }
  }

  static schedule(seconds: number, callback: () => void): NodeJS.Timeout {
    return setInterval(() => {
      callback()
    }, seconds * 1000)
  }

  static timeout(seconds: number, callback: () => void): NodeJS.Timeout {
    return setTimeout(() => {
      callback()
    }, seconds * 1000)
  }
}

export const cronjobService = new CronJobService()
