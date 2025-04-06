import {
  BatteryStatusResponse,
  GatewayStatusResponse,
  SetIntervalResponse,
  SetupChannelResponse,
} from "../types/Response"
import { OPERATORS } from "../types/Topic"
import { cronjobService } from "./cron"
import { databaseService } from "./database"
import { mqttService, MqttService, OnMessageCallback } from "./mqtt"
import { webSocketService, WebSocketService } from "./websocket"

class AppService {
  mqttService: MqttService = mqttService
  webSocketService: WebSocketService = webSocketService

  constructor() {}

  init() {
    mqttService.onMessage(this.handleMqttMessage)
    cronjobService.init()
  }

  handleMqttMessage: OnMessageCallback = (topic, message) => {
    const messageData = JSON.parse(message.toString())
    const { operator } = messageData
    const handlersMap = {
      [OPERATORS.SEND_BATTERY_STATUS]: this.handleBatteryStatusMessage,
      [OPERATORS.SEND_GATEWAY_STATUS]: this.handleGatewayStatusMessage,
      [OPERATORS.SET_INTERVAL]: this.handleSetIntervalMessage,
      [OPERATORS.SETUP_CHANNEL]: this.handleSetupChannelMessage,
    }

    const handler = handlersMap[operator as keyof typeof handlersMap]

    if (typeof handler === "function") {
      handler(messageData)
    } else {
      console.error(`No handler for operator: ${operator}`)
    }
  }

  handleBatteryStatusMessage = (message: BatteryStatusResponse) => {
    databaseService.saveBatteryStatus(message)
    this.webSocketService.broadcast(JSON.stringify(message))
  }
  handleGatewayStatusMessage = (message: GatewayStatusResponse) => {
    databaseService.saveGatewayStatus(message)
    this.webSocketService.broadcast(JSON.stringify(message))
  }
  handleSetIntervalMessage = (message: SetIntervalResponse) => {}
  handleSetupChannelMessage = (message: SetupChannelResponse) => {}
}

export const appService = new AppService()
