export interface BaseRequest {
  time: number
}
export interface SetIntervalRequest extends BaseRequest {
  operator: string
  infor: {
    BatteryStatusInterval: number
    DeviceStatusInterval: number
  }
}

export interface SetupChannelRequest extends BaseRequest {
  operator: string
  infor: {
    usingChannel: string
  }
}
