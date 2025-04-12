import { OPERATORS, Topic } from "../types/Topic"
import type { SetIntervalRequest, SetupChannelRequest } from "../types/Request"
import { BROKER_URL, BROKER_PROTOCOL, BROKER_PASSWORD, BROKER_PORT, BROKER_USERNAME } from "../envConfigs"
import mqtt, { MqttClient } from "mqtt"
import logger from "../logger"

type SetIntervalParams = {
  imei: string
  batterStatusInterval: number
  deviceStatusInterval: number
}

type SetupChannelParameters = {
  imei: string
  usingChannel: string
}

export type OnMessageCallback = (topic: string, message: Buffer<ArrayBufferLike>) => any

export class MqttService {
  private connectUrl: string
  private mqttClient: MqttClient
  private static subscribeTopics: Topic
  private messageHandlers: OnMessageCallback[]
  static initialized: boolean = false
  constructor() {
    this.connectUrl = this.getConnectionUrl()
    this.mqttClient = this.createClient()
    this.messageHandlers = []
  }

  init() {
    if (!MqttService.initialized) {
      this.mqttClient.on("connect", () => {
        let subscribeTopics = [Topic.RESPONSE, Topic.BATTERY_STATUS, Topic.GATEWAY_STATUS, Topic.GATEWAY_ERROR]

        subscribeTopics.forEach((topic) => {
          this.mqttClient.subscribe(topic, () => {})
        })

        this.mqttClient.on("message", (topic, message) => {
          this.messageHandlers.forEach((handler) => handler(topic, message))
        })
      })
    }

    MqttService.initialized = true
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

  setInterval({ imei, batterStatusInterval, deviceStatusInterval }: SetIntervalParams) {
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
  }

  /**
   * Publishes a message to set the channel for device communication.
   *
   * @param {Object} params - The parameters for setting the channel.
   * @param {string} params.imei - The IMEI of the device for which the channel is being set.
   * @param {string} params.usingChannel - The channel to be used for device communication.
   */

  setupChannel({ imei, usingChannel }: SetupChannelParameters) {
    const message: SetupChannelRequest = {
      time: Date.now(),
      operator: OPERATORS.SETUP_CHANNEL,
      infor: {
        usingChannel: usingChannel,
      },
    }
    const topic = `mqtt/vnpt/request${imei}`

    this.mqttClient.publish(topic, JSON.stringify(message))
  }

  publish(options: Record<string, any>) {
    const { topic, message } = options

    if (topic && message) {
      this.mqttClient.publish(topic, JSON.stringify(message))
    }
  }

  onMessage(callback: OnMessageCallback) {
    if (typeof callback === "function") {
      this.messageHandlers.push(callback)
    }
  }
}

export const mqttService = new MqttService()

mqttService.init()
