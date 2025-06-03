import { faker } from "@faker-js/faker"
import { OPERATORS, Topic } from "../types/Topic"
import { mqttService, MqttService } from "./mqtt"
import { databaseService, DevicesFromDB, DeviceIntervalsFromDB } from "./database"
import { BatteryStatusResponse } from "../types/Response"
import pino from "pino"

const log = pino({ level: "info" })
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
  downtrendInterval: number
  downtrendAmpereLimit: number
  downtrendVoltageLimit: number
  isDownTrend: boolean
  isUpTrend: boolean
  batteryStatusInterval: number
}

export class CronJobService {
  devices: DevicesFromDB
  tasks: Task[]
  mqttService: MqttService = mqttService
  private readonly ampereRange: [number, number] = [0, 1]
  private readonly voltageRange: [number, number] = [53, 54]
  private readonly downtrendDurationRange: [number, number] = [5, 7]
  private readonly uptrendDurationRange: [number, number] = [1, 2]
  private readonly downtrendIntervalRange: [number, number] = [5, 10]
  private readonly downtrendAmpereRange: [number, number] = [-50, -20]
  private readonly downtrendVoltageRange: [number, number] = [52, 43]

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
        downtrendDuration: this.getRandomDurationInMinutes(...this.downtrendDurationRange),
        uptrendDuration: this.getRandomDurationInMinutes(...this.uptrendDurationRange),
        downtrendInterval: this.getRandomDurationInMinutes(...this.downtrendIntervalRange),
        downtrendAmpereLimit: this.getRandomInRange(...this.downtrendAmpereRange),
        downtrendVoltageLimit: this.getRandomInRange(...this.downtrendVoltageRange),
        isDownTrend: false,
        isUpTrend: false,
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
        log.info("start downtrend")
        taskData.isDownTrend = true
        taskData.downtrendDuration = this.getRandomDurationInMinutes(...this.downtrendDurationRange)
        taskData.uptrendDuration = this.getRandomDurationInMinutes(...this.uptrendDurationRange)
        taskData.downtrendInterval = this.getRandomDurationInMinutes(...this.downtrendIntervalRange)
        log.info(JSON.stringify(taskData))

        if (taskData.tasks.downtrend) {
          clearInterval(taskData.tasks.downtrend)
          taskData.tasks.downtrend = CronJobService.timeout(taskData.downtrendInterval, downtrendCronHandler)
        }
      }

      CronJobService.timeout(taskData.uptrendDuration, () => {
        log.info("clear downtrend + start uptrend")
        taskData.isDownTrend = false
        taskData.isUpTrend = true
      })

      CronJobService.timeout(taskData.uptrendDuration + taskData.downtrendDuration, () => {
        log.info("clear downtrend + uptrend")
        taskData.isDownTrend = false
        taskData.isUpTrend = false
      })

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
    log.info("get downtrend infor", JSON.stringify(taskData))
    let { downtrendAmpereLimit, downtrendDuration, downtrendVoltageLimit, lastBatteryStatus, batteryStatusInterval } =
      taskData
    let lastInfor = structuredClone(lastBatteryStatus?.infor || {})
    let decreaseTime = batteryStatusInterval / downtrendDuration
    let decreaseAmpere = ((lastInfor?.CH1.Ampere || 0) - downtrendAmpereLimit) * decreaseTime
    let decreaseVoltage = ((lastInfor?.CH1.Voltage || 0) - downtrendVoltageLimit) * decreaseTime

    Object.keys(lastInfor ?? {}).forEach((channel) => {
      let channelInfor = lastInfor?.[channel as keyof typeof lastInfor]
      if (channelInfor) {
        channelInfor.Ampere = channelInfor.Ampere - decreaseAmpere
        channelInfor.Voltage = channelInfor.Voltage - decreaseVoltage
      }
    })

    log.info("getDowntrendInfor lastInfor:", JSON.stringify(lastInfor))
    return lastInfor
  }

  getUptrendInfor(taskData: Task) {
    let { downtrendAmpereLimit, uptrendDuration, downtrendVoltageLimit, lastBatteryStatus, batteryStatusInterval } =
      taskData
    let lastInfor = structuredClone(lastBatteryStatus?.infor || {})
    let decreaseTime = batteryStatusInterval / uptrendDuration
    let decreaseAmpere = (lastInfor?.CH1.Ampere || 0 - downtrendAmpereLimit) * decreaseTime
    let decreaseVoltage = (lastInfor?.CH1.Voltage || 0 - downtrendVoltageLimit) * decreaseTime

    Object.keys(lastInfor ?? {}).forEach((channel) => {
      let channelInfor = lastInfor?.[channel as keyof typeof lastInfor]
      if (channelInfor) {
        channelInfor.Ampere = channelInfor.Ampere + decreaseAmpere
        channelInfor.Voltage = channelInfor.Voltage + decreaseVoltage
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
