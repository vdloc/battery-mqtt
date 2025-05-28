import { faker } from "@faker-js/faker"
import { Topic } from "../types/Topic"
import { mqttService, MqttService } from "./mqtt"
import { databaseService, DevicesFromDB, DeviceIntervalsFromDB } from "./database"
import { BatteryStatusResponse } from "../types/Response"

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
  isDownTrend: boolean
}

class CronJobService {
  devices: DevicesFromDB
  tasks: Task[]
  mqttService: MqttService = mqttService
  constructor() {
    this.devices = []
    this.tasks = []
  }

  async init() {
    this.devices = await databaseService.getDevices(undefined)
    let intervals = await databaseService.getDevicesInterval(this.devices)
    this.tasks = this.sendFakeStatus(intervals)
  }

  createFakeBatteryStatusResponse(imei: string): BatteryStatusResponse {
    let ampereRange: [number, number] = [0, 1]
    let voltageRange: [number, number] = [53, 54]

    return {
      imei,
      operator: "SendBatteryStatus",
      infor: {
        CH1: {
          Voltage: this.getRandomInRange(...voltageRange),
          Ampere: this.getRandomInRange(...ampereRange),
        },
        CH2: {
          Voltage: this.getRandomInRange(...voltageRange),
          Ampere: this.getRandomInRange(...ampereRange),
        },
        CH3: {
          Voltage: this.getRandomInRange(...voltageRange),
          Ampere: this.getRandomInRange(...ampereRange),
        },
        CH4: {
          Voltage: this.getRandomInRange(...voltageRange),
          Ampere: this.getRandomInRange(...ampereRange),
        },
      },
      time: this.getRandomTime(),
    }
  }

  async createFakeGatewayStatusResponse(imei: string) {
    let channel = await databaseService.getSetupChannel(imei)
    return {
      imei,
      operator: "SendStatus",
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
        downtrendDuration: this.getRandomDurationInMinutes(1, 30),
        uptrendDuration: this.getRandomDurationInMinutes(1, 10),
        downtrendInterval: this.getRandomDurationInMinutes(5, 7),
        isDownTrend: false,
      }

      const batteryStatusCronTask = this.schedule(batteryStatusInterval, () => {
        const batteryStatus = this.createFakeBatteryStatusResponse(imei)
        const message = {
          topic: Topic.BATTERY_STATUS,
          message: this.createFakeBatteryStatusResponse(imei),
        }

        this.mqttService?.publish(message)
        taskData.lastBatteryStatus = batteryStatus
      })
      const gatewayStatusCronTask = this.schedule(deviceStatusInterval, async () => {
        const message = {
          topic: Topic.GATEWAY_STATUS,
          message: await this.createFakeGatewayStatusResponse(imei),
        }
        this.mqttService?.publish(message)
      })

      const downtrendCronHandler = () => {
        if (taskData.isDownTrend) return

        taskData.isDownTrend = true
        taskData.downtrendDuration = this.getRandomDurationInMinutes(1, 30)
        taskData.uptrendDuration = this.getRandomDurationInMinutes(1, 10)
        taskData.downtrendInterval = this.getRandomDurationInMinutes(5, 7)

        if (taskData.tasks.downtrend) {
          clearInterval(taskData.tasks.downtrend)
          taskData.tasks.downtrend = this.schedule(taskData.downtrendInterval, downtrendCronHandler)
        }
      }

      const downtrendCronTask = this.schedule(taskData.downtrendInterval, downtrendCronHandler)

      taskData.tasks.battery = batteryStatusCronTask
      taskData.tasks.gateway = gatewayStatusCronTask
      taskData.tasks.downtrend = downtrendCronTask

      return taskData
    })
  }

  createFakeDowntrend() {}

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

      task.tasks.battery = this.schedule(batteryStatusInterval, () => {
        this.mqttService?.publish({ topic: Topic.BATTERY_STATUS, message: this.createFakeBatteryStatusResponse(imei) })
      })
      task.tasks.gateway = this.schedule(deviceStatusInterval, () => {
        this.mqttService?.publish({ topic: Topic.GATEWAY_STATUS, message: this.createFakeGatewayStatusResponse(imei) })
      })
    }
  }

  schedule(seconds: number, callback: () => void): NodeJS.Timeout {
    return setInterval(() => {
      callback()
    }, seconds * 1000)
  }
}

export const cronjobService = new CronJobService()
