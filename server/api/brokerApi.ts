import axios from "axios"
import { OPERATORS, SetIntervalResponse, SetIntervalRequest, SetupChannelRequest } from "../type/Topic.type"
import { BROKER_URL, BROKER_PROTOCOL, BROKER_PASSWORD, BROKER_PORT, BROKER_USERNAME } from "../envConfigs"
import mqtt, { MqttClient } from "mqtt"

interface SetIntervalParameters {
  imei: string
  batterStatusInterval: number
  deviceStatusInterval: number
}

interface SetupChannelParameters {
  imei: string
  usingChannel: string
}

export class BrokerAPI {
  connectUrl: string
  client: MqttClient
  subscribeTopics: string[]
  constructor() {
    this.connectUrl = this.getConnectionUrl()
    this.client = this.createClient()
    this.subscribeTopics = [
      "mqtt/vnpt/response",
      "mqtt/vnpt/battery/status",
      "mqtt/vnpt/gateway/status",
      "mqtt/vnpt/gateway/error",
    ]
  }

  init() {
    this.client.on("connect", () => {
      this.subscribeTopics.forEach((topic) => {
        this.client.subscribe(topic, () => {
          console.log(`Subscribed to ${topic}`)
        })
        this.client.on("message", (topic, message) => {
          console.log(`Received message from ${topic}: ${message.toString()}`)
        })
      })
    })
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

    this.client.publish(topic, JSON.stringify(message))

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

    this.client.publish(`mqtt/vnpt/request${imei}`, JSON.stringify(message))
    return topic
  }
}
