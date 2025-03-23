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
  lastUpdate: new Date(Date.now().toString()),
}))
