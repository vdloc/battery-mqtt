import { useSocket } from "@/components/SocketProvider"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import { Button, Card, Table } from "antd"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
export type DeviceType = {
  id: string
  imei: string
  lastBatteryStatus: {
    CH1: {
      Voltage: string
      Ampere: string
    }
    CH2: {
      Voltage: string
      Ampere: string
    }
    CH3: {
      Voltage: string
      Ampere: string
    }
    CH4: {
      Voltage: string
      Ampere: string
    }
  }
  lastGatewayStatus: {
    operator: string
    RSSI: string
    IP: string
    usingChannel: string
    fwVersion: string
  }
}

const columns = [
  "Stt",
  "Đơn vị",
  "Mã trạm",
  "Tên gợi nhớ",
  "Trạng thái gateway",
  "Volt",
  "Ampe",
  "Bat_interval",
  "Imei",
  "Operator",
  "Số sim",
  "RSSI",
  ,
  "Action",
]
const HomePage = () => {
  const navigate = useNavigate()
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const [lastGatewayStatus, setLastGatewayStatus] = useState<any>({})
  const [batInterval, setBatInterval] = useState<any>({})
  const { data: devices } = useGetDevices()
  const { data: intervals } = useGetIntervals()
  useEffect(() => {
    if (devices && connected) {
      sendMessage(JSON.stringify({ operator: "SET_LISTEN_DEVICE", device: devices.base.map((item: any) => item.imei) }))
    }
    return () => {
      setMessages(null)
    }
  }, [connected, sendMessage, devices])

  useEffect(() => {
    if (devices) {
      setLastGatewayStatus((prevStatus: any) => ({
        ...prevStatus,
        ...devices.lastGatewayStatus,
      }))
    }
  }, [devices])

  useEffect(() => {
    if (intervals) {
      setBatInterval((prevStatus: any) => ({
        ...prevStatus,
        ...intervals.configObj,
      }))
    }
  }, [intervals])

  useEffect(() => {
    if (messages && messages?.operator === "SendStatus") {
      setLastGatewayStatus((prevStatus: any) => ({
        ...prevStatus,
        [messages.imei]: messages.info,
      }))
    }
    if (messages && messages?.operator === "SetInterval") {
      setBatInterval((prevStatus: any) => ({
        ...prevStatus,
        [messages.imei]: messages.info,
      }))
    }
  }, [messages])

  return (
    <Card title={<p className="text-2xl font-bold">List Devices</p>}>
      <Table
        // pagination={{
        //   pageSize: 50,
        // }}
        dataSource={devices?.base?.map((item: any, index: number) => {
          return {
            key: index + 1,
            Stt: item.index,
            "Đơn vị": "--",
            "Mã trạm": "--",
            "Tên gợi nhớ": "--",
            "Trạng thái gateway": lastGatewayStatus[item.imei]?.RSSI,
            Volt: (
              <>
                <b> {item.lastBatteryStatus.CH1.Voltage}</b>/<b>{item.lastBatteryStatus.CH2.Voltage}</b>/
                <b>{item.lastBatteryStatus.CH3.Voltage}</b>/<b>{item.lastBatteryStatus.CH4.Voltage}</b>
              </>
            ),
            Ampe: (
              <>
                {" "}
                <b>{item.lastBatteryStatus.CH1.Ampere}</b>/<b>{item.lastBatteryStatus.CH2.Ampere}</b>/
                <b>{item.lastBatteryStatus.CH3.Ampere}</b>/<b>{item.lastBatteryStatus.CH4.Ampere}</b>
              </>
            ),
            Bat_interval: batInterval[item.imei]?.batteryStatusInterval,
            Imei: item.imei,
            Operator: item.lastGatewayStatus?.operator,
            "Số sim": "--",
            RSSI: item.lastGatewayStatus.RSSI,
            Action: <Button onClick={() => navigate(`/device/${item.imei}`)}>Detail</Button>,
          }
        })}
        columns={columns.map((item) => ({
          title: item,
          dataIndex: item,
          key: item,
        }))}
      />
    </Card>
  )
}

export default HomePage
