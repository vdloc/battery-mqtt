import React, { useState, useEffect } from "react"

const HomePage = () => {
  const [messages, setMessages] = useState([])
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:7777")

    socket.addEventListener("open", () => {
      console.log("WebSocket connection opened")
      setConnectionStatus("Connected")

      socket.send(JSON.stringify({ message: "Hello, Server!" }))
    })

    socket.addEventListener("message", (event) => {
      console.log("Message from server:", event.data)
      setMessages((prevMessages) => [...prevMessages, JSON.parse(event.data)].slice(-10))
    })

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error)
      setConnectionStatus("Error")
    })

    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed")
      setConnectionStatus("Disconnected")
    })

    return () => {
      socket.close()
    }
  }, [])

  return (
    <div>
      <h1>WebSocket Connection Status: {connectionStatus}</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            <p>{JSON.stringify(message)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomePage
