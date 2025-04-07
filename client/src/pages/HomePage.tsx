import { useEffect, useMemo } from "react"
import { trpc } from "../utils/trpc"
import useWebSocket from "../hooks/useWebSocket"

const HomePage = () => {
  const wsUrl = import.meta.env.WS_URL
  const { messages, sendMessage, connected, disconnected, error } = useWebSocket(wsUrl)

  const devices = trpc.getDevices.useQuery()
  const listenDevice = useMemo(() => (devices.data || []).at(0), [devices])

  useEffect(() => {
    if (listenDevice) {
      sendMessage(JSON.stringify({ operator: "SET_LISTEN_DEVICE", device: listenDevice }))
    }
  }, [listenDevice])

  return (
    <div>
      <h1>WebSocket Connection Status: {connected ? "Conneted" : disconnected ? "Disconnected" : "Connecting"}</h1>
      {error && <p>Error: {error}</p>}
      {listenDevice && <p>Listening data for device {listenDevice.imei}</p>}
      <p>Messages:</p>
      <div>{JSON.stringify(messages)}</div>
    </div>
  )
}

export default HomePage
