import { faker } from "@faker-js/faker"
import { schedule, ScheduledTask } from "node-cron"
import { Topic } from "../types/Topic"
import { mqttService, MqttService } from "./mqtt"
import { databaseService, DevicesFromDB, DeviceIntervalsFromDB } from "./database"

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
    battery: NodeJS.Timeout
    gateway: NodeJS.Timeout
  }
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
    this.devices = await databaseService.getDevices()
    let intervals = await databaseService.getDevicesInterval(this.devices)
    this.tasks = this.sendFakeStatus(intervals)
  }

  createFakeBatteryStatusResponse(imei: string) {
    return {
      imei,
      operator: "SendBatteryStatus",
      infor: {
        CH1: {
          Voltage: this.getRandomInRange(30.15, 90.54),
          Ampere: this.getRandomInRange(13, 123),
        },
        CH2: {
          Voltage: this.getRandomInRange(12.23, 156.87),
          Ampere: this.getRandomInRange(17.12, 321),
        },
        CH3: {
          Voltage: this.getRandomInRange(135, 500),
          Ampere: this.getRandomInRange(123, 197),
        },
        CH4: {
          Voltage: this.getRandomInRange(23.21, 78.52),
          Ampere: this.getRandomInRange(97, 354.52),
        },
      },
      time: `${this.getRandomTime()}`,
    }
  }

  createFakeGatewayStatusResponse(imei: string) {
    return {
      imei,
      operator: "SendStatus",
      info: {
        operator: this.getRandomISP(),
        RSSI: this.getRandomInRange(30.15, 90.54),
        IP: this.getRandomIp(),
        usingChannel: this.getRandomChannel(),
        fwVersion: 1.0,
      },
      time: `${this.getRandomTime()}`,
    }
  }

  sendFakeStatus(intervals: DeviceIntervalsFromDB): Task[] {
    if (!this.mqttService) return []

    return intervals.map((status) => {
      const { imei, batteryStatusInterval, deviceStatusInterval } = status
      const batteryStatusCronTask = this.schedule(deviceStatusInterval, () => {
        const message = { topic: Topic.BATTERY_STATUS, message: this.createFakeBatteryStatusResponse(imei) }
        this.mqttService?.publish(message)
      })
      const gatewayStatusCronTask = this.schedule(batteryStatusInterval, () => {
        const message = { topic: Topic.GATEWAY_STATUS, message: this.createFakeGatewayStatusResponse(imei) }
        this.mqttService?.publish(message)
      })

      return {
        imei,
        tasks: {
          battery: batteryStatusCronTask,
          gateway: gatewayStatusCronTask,
        },
      }
    })
  }

  getRandomInRange(min: number, max: number) {
    let randomValue = Math.random() * (max - min) + min
    return randomValue.toFixed(2)
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

  updateTask(imei: string, batteryStatusInterval: number, deviceStatusInterval: number) {
    let task = this.tasks.find((task) => task.imei === imei)

    if (task) {
      clearInterval(task.tasks.battery)
      clearInterval(task.tasks.gateway)
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
