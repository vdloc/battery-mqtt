import useWebSocket from "@/hooks/useWebSocket"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext } from "react"

// const wsUrl = import.meta.env.VITE_WS_URL
const wsUrl = import.meta.env.VITE_WS_URL
interface WebSocketType {
  messages: any
  setMessages: Dispatch<SetStateAction<any>>
  sendMessage: (message: any) => void
  socket: any
  connected: boolean
  error: any
  disconnected: boolean
}
const WebSocket = createContext<WebSocketType | undefined>(undefined)
const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { messages, sendMessage, connected, disconnected, socket, error, setMessages } = useWebSocket(wsUrl)
  console.log("connected", connected)
  console.log("messages", messages)
  return (
    <WebSocket.Provider value={{ messages, sendMessage, connected, socket, disconnected, error, setMessages }}>
      {children}
    </WebSocket.Provider>
  )
}

export default SocketProvider

export const useSocket = (): WebSocketType => {
  const context = useContext(WebSocket)
  if (!context) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
