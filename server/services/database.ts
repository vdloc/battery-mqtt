import { schema, drizzleOrm } from "@fsb/drizzle"
import { DATABASE_URL } from "../envConfigs"
import { drizzle } from "drizzle-orm/node-postgres"
import { BatteryStatusResponse, GatewayStatusResponse } from "../types/Response"
import { eq, and } from "drizzle-orm"
import { DeviceExistedError, DeviceNotFoundError, ManageUnitNotFoundError } from "../helper/errors"

const { asc } = drizzleOrm
const {
  deviceIntervalTable,
  brokerDeviceTable,
  batteryStatusTable,
  gatewayStatusTable,
  setupChannelTable,
  manageUnitTable,
} = schema
const dbUrl = `${DATABASE_URL}`
const db = drizzle(dbUrl, { schema }) as any

export type DevicesFromDB = (typeof brokerDeviceTable.$inferSelect)[]
export type DeviceIntervalsFromDB = (typeof deviceIntervalTable.$inferSelect)[]

interface QueryHelpers {
  eq: <T>(a: T, b: T) => boolean // Define the type of 'eq'
  gte: <T>(a: T, b: T) => boolean // Define the type of 'gte'
  lte: <T>(a: T, b: T) => boolean // Define the type of 'lte'
  and: <T>(...args: T[]) => boolean // Define the type of 'and',
  asc: <T>(a: T) => boolean
}

interface DeviceInput {
  imei: string
  manageUnitId?: string
  aliasName?: string
  stationCode?: string
  simNumber?: string
}

interface DeviceIntervalInput {
  imei: string
  batteryStatusInterval: number | undefined
  deviceStatusInterval: number | undefined
  time: number
}

interface SetupChannelInput {
  imei: string
  usingChannel: string | undefined
  time: number
}

class DatabaseService {
  async getDevices(): Promise<DevicesFromDB> {
    try {
      const devices = await db.query.brokerDeviceTable.findMany({
        orderBy: (device: any, queryHelper: QueryHelpers) => queryHelper.asc(device.time),
      })
      console.log(" devices:", devices)

      return devices
    } catch (error) {
      console.log("Error in getDevices", error)
      return []
    }
  }

  async createDevice(input: DeviceInput) {
    const { imei, manageUnitId } = input
    const existedDevice = await db.query.brokerDeviceTable.findFirst({
      where: eq(brokerDeviceTable.imei as any, imei),
    })
    console.log(" input:", input)

    if (!existedDevice) {
      let record = { ...input, manageUnitName: "", time: Date.now() }
      if (manageUnitId) {
        record.manageUnitName = await this.getManageUnitName(manageUnitId)
      }
      console.log(" record:", record)
      await db.insert(brokerDeviceTable).values(record)

      return record
    }
    throw new DeviceExistedError(imei)
  }

  async updateDevice({ imei, manageUnitId, aliasName, stationCode, simNumber }: DeviceInput) {
    const updateData: Record<string, string> = {}
    if (manageUnitId) updateData.manageUnitId = manageUnitId
    if (aliasName) updateData.aliasName = aliasName
    if (stationCode) updateData.stationCode = stationCode
    if (simNumber) updateData.simNumber = simNumber

    const result = await db
      .update(brokerDeviceTable)
      .set(updateData)
      .where(eq(brokerDeviceTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
  }

  async deleteDevice(imei: string) {
    let result = await db.delete(brokerDeviceTable).where(eq(brokerDeviceTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
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
  async updateDeviceInterval({ imei, batteryStatusInterval, deviceStatusInterval, time }: DeviceIntervalInput) {
    let result = await db
      .update(deviceIntervalTable)
      .set({
        batteryStatusInterval,
        deviceStatusInterval,
        time,
      })
      .where(eq(deviceIntervalTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
  }

  async createDeviceInterval(input: DeviceIntervalInput) {
    const { imei } = input
    const result = await db.insert(deviceIntervalTable).values(input).onConflictDoNothing().returning({
      id: deviceIntervalTable.id,
    })
    if (result.length > 0) return result
    throw new DeviceExistedError(imei)
  }

  async deleteDeviceInterval(imei: string) {
    const result = await db.delete(deviceIntervalTable).where(eq(deviceIntervalTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
  }

  async updateSetupChannel({ imei, usingChannel, time }: any) {
    let result = await db
      .update(setupChannelTable)
      .set({
        usingChannel,
        time,
      })
      .where(eq(setupChannelTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
  }

  async createSetupChannel(input: SetupChannelInput) {
    const { imei } = input
    const result = await db.insert(setupChannelTable).values(input).onConflictDoNothing().returning({
      id: setupChannelTable.id,
    })
    if (result.length > 0) return result
    throw new DeviceExistedError(imei)
  }

  async deleteSetupChannel(imei: string) {
    const result = await db.delete(setupChannelTable).where(eq(setupChannelTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
  }

  async saveBatteryStatus(data: BatteryStatusResponse) {
    const { imei, infor, time } = data

    return await Promise.all([
      db.insert(batteryStatusTable).values({ imei, infor: JSON.stringify(infor), time }),
      db
        .update(brokerDeviceTable)
        .set({
          lastBatteryStatus: JSON.stringify(infor),
        })
        .where(eq(brokerDeviceTable.imei as any, imei)),
    ])
  }
  async deleteBatteryStatusByImei(imei: string) {
    const result = await db.delete(batteryStatusTable).where(eq(batteryStatusTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
  }

  async saveGatewayStatus(data: GatewayStatusResponse) {
    const { imei, info, time } = data

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
  async deleteGatewayStatusByImei(imei: string) {
    const result = await db.delete(gatewayStatusTable).where(eq(gatewayStatusTable.imei as any, imei))
    if (result.rowCount > 0) return result
    throw new DeviceNotFoundError(imei)
  }

  async getDeviceStatus(data: any) {
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
  }

  async getManageUnits() {
    const manageUnits = await db.query.manageUnitTable.findMany({})
    return manageUnits
  }

  async getManageUnitName(id: string) {
    const manageUnit = await db.query.manageUnitTable.findFirst({
      where: eq(manageUnitTable.id as any, id),
    })
    if (manageUnit) return manageUnit?.name
    throw new ManageUnitNotFoundError(id)
  }

  async updateManageUnit({ name, id }: { name: string; id: string }) {
    const result = await db
      .update(manageUnitTable)
      .set({
        name,
      })
      .where(eq(manageUnitTable.id as any, id))
    if (result.rowCount > 0) return result
    throw new ManageUnitNotFoundError(id)
  }

  async deleteManageUnit({ id }: { id: string }) {
    let result = await db.delete(manageUnitTable).where(eq(manageUnitTable.id as any, id))
    if (result.rowCount > 0) return result
    throw new ManageUnitNotFoundError(id)
  }

  async createManageUnit({ name }: { name: string }) {
    return await db.insert(manageUnitTable).values({ name })
  }
}

export const databaseService = new DatabaseService()
