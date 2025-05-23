import { WS_HOST, WS_PORT } from "../envConfigs"
import WebSocket from "ws"
import { SetListenDeviceData, WS_OPERATORS } from "../types/Websocket"
import { randomUUID, UUID } from "crypto"

type ClientData = {
  id: UUID
  devices: string[] | string
}

export class WebSocketService {
  private server: WebSocket.Server
  public clientsMap = new Map<WebSocket, ClientData>()

  constructor() {
    this.server = new WebSocket.Server({
      port: Number(WS_PORT),
      host: WS_HOST,
      autoPong: true,
      clientTracking: true,
    }) as WebSocket.Server

    this.server.on("connection", (ws) => {
      this.clientsMap.set(ws, {
        id: randomUUID(),
        devices: [],
      })
      ws.on("message", (message) => {
        try {
          let data = JSON.parse(message.toString())
          if (typeof data !== "object") {
            data = JSON.parse(data)
          }
          const { operator } = data

          const handlersMap = {
            [WS_OPERATORS.SET_LISTEN_DEVICE]: this.handleSetListenDevice,
          }
          const handler = handlersMap[operator as keyof typeof handlersMap]

          if (typeof handler === "function") {
            handler(ws, data)
          }
        } catch (error) {
          console.log(error)
        }
      })
      ws.on("close", () => {
        this.clientsMap.delete(ws)
        console.log("Client disconnected")
      })
    })
  }

  handleSetListenDevice = (client: WebSocket, data: SetListenDeviceData) => {
    const { devices } = data
    const clientData = this.clientsMap.get(client)

    if (clientData) {
      clientData.devices = devices
      this.clientsMap.set(client, clientData)
    }
  }

  getClients() {
    return this.server.clients
  }

  getClientsMap() {
    return this.clientsMap
  }
}

export const webSocketService = new WebSocketService()
