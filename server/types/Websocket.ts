import { DevicesFromDB } from "../services/database"

export enum WS_OPERATORS {
  SET_LISTEN_DEVICE = "SET_LISTEN_DEVICE",
}

export interface SetListenDeviceData {
  operator: WS_OPERATORS.SET_LISTEN_DEVICE
  devices: string[]
}
