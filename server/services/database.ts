import { schema } from "@fsb/drizzle"
import { DATABASE_URL } from "../envConfigs"
import { drizzle } from "drizzle-orm/node-postgres"
import { BatteryStatusResponse, GatewayStatusResponse } from "../types/Response"
import { desc, eq, and, exists } from "drizzle-orm"

const { deviceIntervalTable, brokerDeviceTable, batteryStatusTable, gatewayStatusTable, setupChannelTable } = schema
const dbUrl = `${DATABASE_URL}`
const db = drizzle(dbUrl, { schema }) as any

export type DevicesFromDB = (typeof brokerDeviceTable.$inferSelect)[]
export type DeviceIntervalsFromDB = (typeof deviceIntervalTable.$inferSelect)[]

interface QueryHelpers {
  eq: <T>(a: T, b: T) => boolean // Define the type of 'eq'
  gte: <T>(a: T, b: T) => boolean // Define the type of 'gte'
  lte: <T>(a: T, b: T) => boolean // Define the type of 'lte'
  and: <T>(...args: T[]) => boolean // Define the type of 'and'
}

interface UpdateDeviceParams {
  imei: string
  manageUnitId?: string
  aliasName?: string
  stationCode?: string
  simNumber?: string
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

  async updateDevice({ imei, manageUnitId, aliasName, stationCode, simNumber }: UpdateDeviceParams) {
    try {
      const updateData: Record<string, string> = {}
      if (manageUnitId) updateData.manageUnitId = manageUnitId
      if (aliasName) updateData.aliasName = aliasName
      if (stationCode) updateData.stationCode = stationCode
      if (simNumber) updateData.simNumber = simNumber

      return await db
        .update(brokerDeviceTable)
        .set(updateData)
        .where(eq(brokerDeviceTable.imei as any, imei))
    } catch (error) {
      console.log("Error in updateDevice", error)
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
  async updateDeviceInterval({ imei, batteryStatusInterval, deviceStatusInterval, time }: any) {
    try {
      return await db
        .update(deviceIntervalTable)
        .set({
          batteryStatusInterval,
          deviceStatusInterval,
          time,
        })
        .where(eq(deviceIntervalTable.imei as any, imei))
    } catch (error) {
      console.log("Error in updateDeviceInterval", error)
    }
  }

  async updateSetupChannel({ imei, usingChannel, time }: any) {
    try {
      return await db
        .update(setupChannelTable)
        .set({
          usingChannel,
          time,
        })
        .where(eq(setupChannelTable.imei as any, imei))
    } catch (error) {
      console.log("Error in updateSetupChannel", error)
    }
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

      return []
    } catch (error) {
      console.log("Error in saveBatteryStatus", error)
    }
  }

  async saveGatewayStatus(data: GatewayStatusResponse) {
    const { imei, info, time } = data

    try {
      let existedTimeRecords = await db.query.batteryStatusTable.findFirst({
        where: (batteryStatus: any, { eq, and }: QueryHelpers) => {
          return and(eq(batteryStatus.imei, imei), eq(batteryStatus.time, time))
        },
      })
      if (!existedTimeRecords) {
        return await Promise.all([
          db.insert(gatewayStatusTable).values({ imei, infor: JSON.stringify(info), time }),
          db
            .update(brokerDeviceTable)
            .set({
              lastGatewayStatus: JSON.stringify(info),
            })
            .where(and(eq(brokerDeviceTable.imei as any, imei))),
        ])
      }

      return []
    } catch (error) {
      console.log("Error in saveGatewayStatus", error)
    }
  }

  async getDeviceStatus(data: any) {
    try {
      const sortParams = { time: true }
      const { imei, timeStart, timeEnd, sort = {}, limit = 50 } = data

      Object.assign(sort, sortParams)

      const batteryStatuses = db.query.batteryStatusTable.findMany({
        where: (status: any, { eq, gte, lte, and }: QueryHelpers) => {
          return and(eq(status.imei, imei), gte(status.time, timeStart), lte(status.time, timeEnd))
        },
        limit,
      })
      const gatewayStatuses = db.query.gatewayStatusTable.findMany({
        where: (status: any, { eq, gte, lte, and }: QueryHelpers) => {
          return and(eq(status.imei, imei), gte(status.time, timeStart), lte(status.time, timeEnd))
        },
        limit,
      })

      return await Promise.all([batteryStatuses, gatewayStatuses])
    } catch (error) {
      console.log("Error in getDeviceStatus", error)
      return []
    }
  }

  async getManageUnits() {
    try {
      const manageUnits = await db.query.manageUnitTable.findMany({
        limit: 100,
      })

      return manageUnits
    } catch (error) {
      console.log("Error in getManageUnits", error)
      return []
    }
  }

  async updateManageUnit({ name }: { name: string }) {
    try {
      return await db.insert(schema.manageUnitTable).values({ name })
    } catch (error) {
      console.log("Error in updateManageUnit", error)
    }
  }
}

export const databaseService = new DatabaseService()
