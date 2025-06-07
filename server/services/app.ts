import { HANDLE_FAKE_DATA } from "../envConfigs"
import {
  BatteryStatusResponse,
  GatewayErrorResponse,
  GatewayStatusResponse,
  SetIntervalResponse,
  SetupChannelResponse,
} from "../types/Response"
import { OPERATORS } from "../types/Topic"
import { cronjobService } from "./cron"
import { databaseService } from "./database"
import { mailService } from "./mail"
import { mqttService, MqttService, OnMessageCallback } from "./mqtt"
import notificationService from "./notification"
import { webSocketService, WebSocketService } from "./websocket"

class AppService {
  mqttService: MqttService = mqttService
  webSocketService: WebSocketService = webSocketService

  constructor() {
    // mailService.sendMail("uvcudlco@gmail.com", "Test", "Test").then(console.log)
  }

  init() {
    if (HANDLE_FAKE_DATA) {
      mqttService.onMessage(this.handleMqttMessage)
      cronjobService.init()
    }
  }

  handleMqttMessage: OnMessageCallback = (topic, message) => {
    const messageData = JSON.parse(message.toString())
    const { operator } = messageData
    const handlersMap = {
      [OPERATORS.SEND_BATTERY_STATUS]: this.handleBatteryStatusMessage,
      [OPERATORS.SEND_GATEWAY_STATUS]: this.handleGatewayStatusMessage,
      [OPERATORS.SET_INTERVAL]: this.handleSetIntervalMessage,
      [OPERATORS.SETUP_CHANNEL]: this.handleSetupChannelMessage,
      default: this.handleErrorGatewayMessage,
    }

    const handler = handlersMap[operator as keyof typeof handlersMap] || handlersMap.default

    if (typeof handler === "function") {
      handler(messageData)
    } else {
      console.error(`No handler for operator: ${operator}`)
    }
  }

  handleBatteryStatusMessage = (message: BatteryStatusResponse) => {
    databaseService.saveBatteryStatus(message)
    this.sendMessageToClients(message)
    notificationService.checkAndSendNotification(message)
  }
  handleGatewayStatusMessage = (message: GatewayStatusResponse) => {
    databaseService.saveGatewayStatus(message)
    this.sendMessageToClients(message)
  }
  handleSetIntervalMessage = (message: SetIntervalResponse) => {
    databaseService.updateDeviceInterval({
      imei: message.imei,
      batteryStatusInterval: message.infor.BatteryStatusInterval,
      deviceStatusInterval: message.infor.DeviceStatusInterval,
      time: message.time,
    })
    this.sendMessageToClients(message)
  }
  handleSetupChannelMessage = (message: SetupChannelResponse) => {
    databaseService.updateSetupChannel({
      imei: message.imei,
      usingChannel: message.infor.usingChannel,
      time: message.time,
    })
    this.sendMessageToClients(message)
  }
  handleErrorGatewayMessage = (message: GatewayErrorResponse) => {
    // databaseService.updateSetupChannel({
    //   imei: message.imei,
    //   usingChannel: message.infor.usingChannel,
    //   time: message.time,
    // })
    this.sendMessageToClients(message)
  }

  sendMessageToClients = (message: any) => {
    let clients = this.webSocketService.getClients()
    let clientsMap = this.webSocketService.getClientsMap()

    clients.forEach((client: any) => {
      let imeis = clientsMap.get(client)?.devices
      if (
        !imeis ||
        (typeof imeis === "string" && imeis === message.imei) ||
        (Array.isArray(imeis) && imeis.includes(message.imei))
      ) {
        client.send(JSON.stringify(message))
      }
    })
  }
}

export const appService = new AppService()
