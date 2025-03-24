import { DATABASE_URL } from "./envConfigs"
import { schema } from "@fsb/drizzle"
import { drizzle } from "drizzle-orm/node-postgres"
import { InferModelFromColumns, type InferModel } from "drizzle-orm"
import { eq } from "drizzle-orm"

const { deviceIntervalTable, brokerDeviceTable } = schema
let dbUrl = `${DATABASE_URL}`
// Initialize a database connection (assuming opts.ctx.db is your database instance)
const db = drizzle(dbUrl, { schema })

type Devices = (typeof brokerDeviceTable.$inferSelect)[]

class BrokerCronJob {
  devices: Devices
  constructor() {
    this.devices = []
  }

  async init() {
    this.devices = await this.getDevices()
    let intervals = await this.getDevicesInterval(this.devices)
    console.log(" intervals:", intervals)
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

  createFakeStatusResponse(imei: string) {
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

  getRandomInRange(min: number, max: number) {
    let randomValue = Math.random() * (max - min) + min
    return randomValue.toFixed(2)
  }
}

export const cronjob = new BrokerCronJob()
