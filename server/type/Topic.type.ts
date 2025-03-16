interface BaseRequest {
  time: number
}
export interface SetIntervalRequest extends BaseRequest {
  operator: string
  infor: {
    BatteryStatusInterval: number
    DeviceStatusInterval: number
  }
}

export interface SetIntervalResponse extends SetIntervalRequest {
  imei: string
}

export interface SetupChannelRequest extends BaseRequest {
  operator: string
  infor: {
    usingChannel: string
  }
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

export enum OPERATORS {
  SET_INTERVAL = "SetInterval",
  SEND_BATTERY_STATUS = "SendBatteryStatus",
  SEND_GATEWAY_STATUS = "SendStatus",
  SETUP_CHANNEL = "SetupChannel",
}
