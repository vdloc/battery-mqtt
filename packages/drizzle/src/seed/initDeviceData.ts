import { getRandom } from "node-imei"
import { randomUUID } from "crypto"

interface DeviceRecord {
  id: string
  imei: string
  time: number
  usingChannel: string
  manageUnitId: string
  manageUnitName: string
  aliasName: string
}

export const devices: any[] = Array.from({ length: 1 }).map(() => ({
  id: randomUUID(),
  imei: getRandom(),
  time: Date.now(),
}))

export const deviceStatusIntervals = devices.map(({ imei }) => ({
  id: randomUUID(),
  imei,
  batteryStatusInterval: 30,
  deviceStatusInterval: 30,
  time: Date.now(),
}))

export const deviceSetupChannels = devices.map(({ imei }) => ({
  id: randomUUID(),
  imei,
  usingChannel: Array.from({ length: 4 })
    .map(() => Math.round(Math.random()))
    .join(""),
  time: Date.now(),
}))
