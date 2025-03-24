import { getRandom } from "node-imei"
import { randomUUID } from "crypto"

interface DeviceRecord {
  id: string
  imei: string
}

export const devices: DeviceRecord[] = Array.from({ length: 50 }).map(() => ({
  id: randomUUID(),
  imei: getRandom(),
}))

export const deviceStatusIntervals = devices.map(({ imei }) => ({
  id: randomUUID(),
  imei,
  batteryStatusInterval: 30,
  deviceStatusInterval: 30,
  lastUpdate: new Date(),
}))

export const deviceSetupChannels = devices.map(({ imei }) => ({
  id: randomUUID(),
  imei,
  usingChannel: Array.from({ length: 4 })
    .map(() => Math.random)
    .join(""),
  lastUpdate: new Date(),
}))
