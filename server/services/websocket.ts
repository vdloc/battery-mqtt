import { WS_HOST, WS_PORT } from "../envConfigs"
import WebSocket from "ws"
interface SetupChannelParameters {
  imei: string
  usingChannel: string
}

export class WebSocketService {
  private server: WebSocket.Server

  constructor() {
    this.server = new WebSocket.Server({
      port: Number(WS_PORT),
      host: WS_HOST,
      autoPong: true,
      clientTracking: true,
    }) as WebSocket.Server

    this.server.on("connection", (ws) => {
      ws.on("message", (message) => {
        console.log(`Received message: ${message}`)
      })
    })
  }

  broadcast(data: any) {
    this.server.clients.forEach((client) => {
      client.send(data)
    })
  }
}

export const webSocketService = new WebSocketService()
