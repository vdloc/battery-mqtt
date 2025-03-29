import {
  OPERATORS,
  SetIntervalResponse,
  SetIntervalRequest,
  SetupChannelRequest,
  BatteryStatusResponse,
} from "../type/Topic.type"
import { BROKER_URL, BROKER_PROTOCOL, BROKER_PASSWORD, BROKER_PORT, BROKER_USERNAME } from "../envConfigs"
import mqtt, { MqttClient } from "mqtt"
import WebSocket, { WebSocketServer } from "ws"
import logger from "../logger"

interface SetIntervalParameters {
  imei: string
  batterStatusInterval: number
  deviceStatusInterval: number
}

interface SetupChannelParameters {
  imei: string
  usingChannel: string
}

export enum Topic {
  REQUEST = "mqtt/vnpt/request",
  RESPONSE = "mqtt/vnpt/response",
  BATTERY_STATUS = "mqtt/vnpt/battery/status",
  GATEWAY_STATUS = "mqtt/vnpt/gateway/status",
  GATEWAY_ERROR = "mqtt/vnpt/gateway/error",
}

class BrokerAPI {
  connectUrl: string
  mqttClient: MqttClient
  wsServer: WebSocketServer | null
  static subscribeTopics: Topic

  constructor() {
    this.connectUrl = this.getConnectionUrl()
    this.mqttClient = this.createClient()
    this.wsServer = null
  }

  init() {
    this.mqttClient.on("connect", () => {
      Object.entries(Topic)
        .filter(([key]) => key !== "REQUEST")
        .forEach((topic) => {
          this.mqttClient.subscribe(topic, () => {
            logger.info(`Subscribed to ${topic}`)
          })
          this.mqttClient.on("message", (topic, message) => {
            logger.info(`Received message from ${topic}: ${message.toString()}`)
            this.broadcast(message)
          })
        })
    })

    this.wsServer = this.createWebSocketServer()
  }

  getConnectionUrl() {
    return `${BROKER_PROTOCOL}://${BROKER_URL}:${BROKER_PORT}`
  }

  getClientId() {
    return `mqtt_${Math.random().toString(16).slice(3)}`
  }

  createClient() {
    return mqtt.connect(this.connectUrl, {
      username: BROKER_USERNAME,
      password: BROKER_PASSWORD,
      clientId: this.getClientId(),
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    })
  }

  createWebSocketServer() {
    return new WebSocket.Server({ port: 7777 })
  }

  setInterval({ imei, batterStatusInterval, deviceStatusInterval }: SetIntervalParameters) {
    const message: SetIntervalRequest = {
      time: Date.now(),
      operator: OPERATORS.SET_INTERVAL,
      infor: {
        BatteryStatusInterval: batterStatusInterval,
        DeviceStatusInterval: deviceStatusInterval,
      },
    }
    const topic = `mqtt/vnpt/request${imei}`

    this.mqttClient.publish(topic, JSON.stringify(message))

    return topic
  }

  setupChannel({ imei, usingChannel }: SetupChannelParameters) {
    const message: SetupChannelRequest = {
      time: Date.now(),
      operator: OPERATORS.SETUP_CHANNEL,
      infor: {
        usingChannel: usingChannel,
      },
    }
    const topic = `mqtt/vnpt/request${imei}`

    this.mqttClient.publish(`mqtt/vnpt/request${imei}`, JSON.stringify(message))
    return topic
  }

  publish(options: Record<string, any>) {
    const { topic, message } = options

    if (topic && message) {
      this.mqttClient.publish(topic, JSON.stringify(message))
    }
  }

  broadcast(data: Buffer<ArrayBufferLike>) {
    console.log(" data:", data.toString())
    this.wsServer?.clients.forEach((client) => {
      client.send(data.toString())
    })
  }
}

export const brokerApi = new BrokerAPI()

export type BrokerAPIType = typeof brokerApi
