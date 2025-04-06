export enum Topic {
  REQUEST = "mqtt/vnpt/request",
  RESPONSE = "mqtt/vnpt/response",
  BATTERY_STATUS = "mqtt/vnpt/battery/status",
  GATEWAY_STATUS = "mqtt/vnpt/gateway/status",
  GATEWAY_ERROR = "mqtt/vnpt/gateway/error",
}

export enum OPERATORS {
  SET_INTERVAL = "SetInterval",
  SEND_BATTERY_STATUS = "SendBatteryStatus",
  SEND_GATEWAY_STATUS = "SendStatus",
  SETUP_CHANNEL = "SetupChannel",
}
