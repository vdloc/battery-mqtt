import { DATABASE_URL } from "./envConfigs"
import { schema } from "@fsb/drizzle"
import { drizzle } from "drizzle-orm/node-postgres"
import { BrokerAPIType, Topic } from "./api/brokerApi"
import { faker } from "@faker-js/faker"
import { schedule, ScheduledTask } from "node-cron"
import logger from "./logger"

const { deviceIntervalTable, brokerDeviceTable } = schema
let dbUrl = `${DATABASE_URL}`
// Initialize a database connection (assuming opts.ctx.db is your database instance)
const db = drizzle(dbUrl, { schema })

type Devices = (typeof brokerDeviceTable.$inferSelect)[]
type DeviceInterval = (typeof deviceIntervalTable.$inferSelect)[]

enum ISP {
  VNPT = "VNPT",
  VTC = "VTC",
  MOBIFONE = "MOBIFONE",
  VIETTEL = "VIETTEL",
  GMOBILE = "GMOBILE",
  FPT = "FPT",
}

class BrokerCronJob {
  devices: Devices
  tasks: ScheduledTask[]
  publisher: BrokerAPIType | null
  constructor() {
    this.devices = []
    this.tasks = []
    this.publisher = null
  }

  async init(publisher: BrokerAPIType) {
    logger.info("Starting cron job")
    this.publisher = publisher
    this.devices = await this.getDevices()
    let intervals = await this.getDevicesInterval(this.devices)
    logger.info(" intervals:", JSON.stringify(intervals))
    this.tasks = this.sendFakeStatus(intervals)
  }

  async getDevices() {
    try {
      const devices = await db.query.brokerDeviceTable.findMany()

      return devices
    } catch (error) {
      console.log("Error in getDevices", error)
      return
    }
  }

  async getDevicesInterval(devices: Devices) {
    return Promise.all(
      devices.map(async (device) => {
        const imei = device.imei
        const interval = await db.query.deviceIntervalTable.findFirst({
          where: (deviceInterval, { eq }) => eq(deviceInterval.imei, imei),
        })

        return interval
      })
    )
  }

  createFakeBatteryStatusResponse(imei: string) {
    return {
      imei,
      operator: "SendBatteryStatus",
      infor: {
        CH1: {
          Voltage: this.getRandomInRange(30.15, 90.54),
          Ampere: this.getRandomInRange(30.15, 200),
        },
        CH2: {
          Voltage: this.getRandomInRange(30.15, 90.54),
          Ampere: this.getRandomInRange(30.15, 200),
        },
        CH3: {
          Voltage: this.getRandomInRange(30.15, 90.54),
          Ampere: this.getRandomInRange(30.15, 200),
        },
        CH4: {
          Voltage: this.getRandomInRange(30.15, 90.54),
          Ampere: this.getRandomInRange(30.15, 200),
        },
      },
      time: `${Date.now()}`,
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
      time: `${Date.now()}`,
    }
  }

  sendFakeStatus(intervals: DeviceInterval): ScheduledTask[] {
    if (!this.publisher) return []

    return intervals.flatMap((status) => {
      const { imei, batteryStatusInterval, deviceStatusInterval } = status
      const batteryStatus = this.createFakeBatteryStatusResponse(imei)
      const gatewayStatus = this.createFakeGatewayStatusResponse(imei)

      const batteryStatusCronTask = schedule(`${deviceStatusInterval} * * * * *`, () => {
        this.publisher.publish({ topic: Topic.BATTERY_STATUS, message: batteryStatus }, () => {
          logger.info(`Sent battery status for ${imei} at ${Date.now()}`)
        })
      })
      const gatewayStatusCronTask = schedule(`${batteryStatusInterval} * * * * *`, () => {
        this.publisher.publish({ topic: Topic.GATEWAY_STATUS, message: gatewayStatus }, () => {
          logger.info(`Sent gateway status for ${imei} at ${Date.now()}`)
        })
      })
      return [batteryStatusCronTask, gatewayStatusCronTask]
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
}

export const cronjob = new BrokerCronJob()
