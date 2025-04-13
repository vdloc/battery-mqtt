import { useState, useEffect, useCallback, useRef } from "react"

const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState("")
  const [disconnected, setDisconnected] = useState(false)
  const socketRef = useRef(null as WebSocket | null)

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket is not connected")
    }
  }, [])

  useEffect(() => {
    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.addEventListener("open", () => {
      console.log("WebSocket connection opened")
      setConnected(true)
      socket.send(JSON.stringify({ message: "Hello, Server!" }))
    })

    socket.addEventListener("message", (event) => {
      console.log("Message from server:", event.data)
      let messages = event.data.length ? event.data : [event.data]
      setMessages(JSON.parse(messages))
    })

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error)
      setError(`WebSocket error: ${error}`)
    })

    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed")
      setDisconnected(true)
      setConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  return {
    messages,
    sendMessage,
    socket: socketRef.current,
    connected,
    error,
    disconnected,
    setMessages,
  }
}

export default useWebSocket
