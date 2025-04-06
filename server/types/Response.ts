import { SetIntervalRequest, SetupChannelRequest, BaseRequest } from "./Request"

export interface SetIntervalResponse extends SetIntervalRequest {
  imei: string
}

export interface SetupChannelResponse extends SetupChannelRequest {
  imei: string
}

export interface BatteryStatusResponse extends BaseRequest {
  imei: string
  infor: Record<
    string,
    {
      Voltage: number
      Ampere: number
    }
  >
  operator: string
}

export interface GatewayStatusResponse extends BaseRequest {
  imei: string
  info: {
    operator: string
    RSSI: number
    IP: string
    usingChannel: number
    fwVersion: string
  }
  operator: string
}

export interface GatewayErrorResponse extends BaseRequest {
  imei: string
  errorVoltageConnection: string
  errorAmpereConnection: string
}
