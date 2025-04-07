import { schema } from "@fsb/drizzle"
import { DATABASE_URL } from "../envConfigs"
import { drizzle } from "drizzle-orm/node-postgres"
import { BatteryStatusResponse, GatewayStatusResponse } from "../types/Response"
import { eq } from "drizzle-orm"

const { deviceIntervalTable, brokerDeviceTable, batteryStatusTable, gatewayStatusTable } = schema
const dbUrl = `${DATABASE_URL}`
const db = drizzle(dbUrl, { schema }) as any

export type DevicesFromDB = (typeof brokerDeviceTable.$inferSelect)[]
export type DeviceIntervalsFromDB = (typeof deviceIntervalTable.$inferSelect)[]

interface QueryHelpers {
  eq: <T>(a: T, b: T) => boolean // Define the type of 'eq'
}

class DatabaseService {
  private db: any
  constructor() {}

  async getDevices(): Promise<DevicesFromDB> {
    try {
      const devices = await db.query.brokerDeviceTable.findMany()

      return devices
    } catch (error) {
      console.log("Error in getDevices", error)
      return []
    }
  }

  async getDevicesInterval(devices: DevicesFromDB): Promise<DeviceIntervalsFromDB> {
    return Promise.all(
      devices.map(async (device) => {
        const imei = device.imei
        const interval = await db.query.deviceIntervalTable.findFirst({
          where: (deviceInterval: any, queryHelper: QueryHelpers) => queryHelper.eq(deviceInterval.imei, imei),
        })
        return interval
      })
    )
  }

  async saveBatteryStatus(data: BatteryStatusResponse) {
    const { imei, infor, time } = data

    try {
      return await Promise.all([
        db.insert(batteryStatusTable).values({ imei, infor: JSON.stringify(infor), time }),
        db
          .update(brokerDeviceTable)
          .set({
            lastBatteryStatus: JSON.stringify(infor),
          })
          .where(eq(brokerDeviceTable.imei as any, imei)),
      ])
    } catch (error) {
      console.log("Error in saveBatteryStatus", error)
    }
  }

  async saveGatewayStatus(data: GatewayStatusResponse) {
    const { imei, info, time } = data
    try {
      return await Promise.all([
        db.insert(gatewayStatusTable).values({ imei, infor: JSON.stringify(info), time }),
        db
          .update(brokerDeviceTable)
          .set({
            lastGatewayStatus: JSON.stringify(info),
          })
          .where(eq(brokerDeviceTable.imei as any, imei)),
      ])
    } catch (error) {
      console.log("Error in saveGatewayStatus", error)
    }
  }
}

export const databaseService = new DatabaseService()
