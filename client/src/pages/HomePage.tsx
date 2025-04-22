import { useSocket } from "@/components/SocketProvider"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import { Button, Card, Input, Table } from "antd"
import { useEffect, useMemo, useState } from "react"
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
  "Battery Interval",
  "Device Interval",
  "Imei",
  "Operator",
  "Số sim",
  "RSSI",
  "Action",
]
const HomePage = () => {
  const navigate = useNavigate()
  const [deviceSetupChannelsStatus, setDeviceSetupChannelsStatus] = useState<any>({})
  const [search, setSearch] = useState("")
  const { data: deviceSetupChannels } = useGetDeviceSetupChannels()
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const [lastGatewayStatus, setLastGatewayStatus] = useState<any>({})
  const [lastBatteryStatus, setLastBatteryStatus] = useState<any>({})
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
      setLastBatteryStatus((prevStatus: any) => ({
        ...prevStatus,
        ...devices.lastBatteryStatus,
      }))
    }
  }, [devices])

  useEffect(() => {
    if (deviceSetupChannels) {
      setDeviceSetupChannelsStatus((prevStatus: any) => ({
        ...prevStatus,
        ...deviceSetupChannels.configObj,
      }))
    }
  }, [deviceSetupChannels])

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
    if (messages && messages?.operator === "SendBatteryStatus") {
      setLastBatteryStatus((prevStatus: any) => ({
        ...prevStatus,
        [messages.imei]: messages.infor,
      }))
    }
    if (messages && messages?.operator === "SetInterval") {
      setBatInterval((prevStatus: any) => ({
        ...prevStatus,
        [messages.imei]: {
          ...prevStatus[messages.imei],
          batteryStatusInterval: messages.infor.BatteryStatusInterval,
          deviceStatusInterval: messages.infor.DeviceStatusInterval,
        },
      }))
    }
    if (messages && messages?.operator === "SetupChannel") {
      setDeviceSetupChannelsStatus((prevStatus: any) => ({
        ...prevStatus,
        [messages.imei]: messages.info,
      }))
    }
  }, [messages])

  const dataToShow = useMemo(() => {
    if (search) {
      return devices?.base.filter(
        (item: any) =>
          item.aliasName.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.imei.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.simNumber.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.stationCode.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.manageUnitName.toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
    }
    return devices?.base
  }, [search, devices])
  return (
    <Card
      title={<p className="text-2xl font-bold">List Devices</p>}
      extra={
        <Input
          placeholder="Từ khóa..."
          className="!w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      }
    >
      <Table
        // pagination={{
        //   pageSize: 50,
        // }}
        dataSource={dataToShow?.map((item: any, index: number) => {
          const channelsStatus = deviceSetupChannelsStatus[item.imei]?.usingChannel

          return {
            key: index + 1,
            Stt: item.index,
            "Đơn vị": item.manageUnitName,
            "Mã trạm": item.stationCode,
            "Tên gợi nhớ": item.aliasName,
            "Trạng thái gateway": lastGatewayStatus[item.imei]?.RSSI,
            Volt: (
              <>
                <p>
                  {channelsStatus?.[0] === "1" && <b>{lastBatteryStatus[item.imei]?.CH1?.Voltage}</b>}
                  {channelsStatus?.[1] === "1" && (
                    <>
                      {channelsStatus?.[0] === "1" && "/"} <b>{lastBatteryStatus[item.imei]?.CH2?.Voltage}</b>
                    </>
                  )}
                  {channelsStatus?.[2] === "1" && (
                    <>
                      {channelsStatus?.[1] === "1" && "/"}
                      <b>{lastBatteryStatus[item.imei]?.CH3?.Voltage}</b>
                    </>
                  )}
                  {channelsStatus?.[3] === "1" && (
                    <>
                      {channelsStatus?.[2] === "1" && "/"}
                      <b>{lastBatteryStatus[item.imei]?.CH4?.Voltage}</b>
                    </>
                  )}
                </p>
                <p>{channelsStatus}</p>
              </>
            ),
            Ampe: channelsStatus ? (
              <>
                {channelsStatus?.[0] === "1" && <b>{lastBatteryStatus[item.imei]?.CH1?.Ampere}</b>}
                {channelsStatus?.[1] === "1" && (
                  <>
                    {channelsStatus?.[0] === "1" && "/"} <b>{lastBatteryStatus[item.imei]?.CH2?.Ampere}</b>
                  </>
                )}
                {channelsStatus?.[2] === "1" && (
                  <>
                    {channelsStatus?.[1] === "1" && "/"}
                    <b>{lastBatteryStatus[item.imei]?.CH3?.Ampere}</b>
                  </>
                )}
                {channelsStatus?.[3] === "1" && (
                  <>
                    {channelsStatus?.[2] === "1" && "/"}
                    <b>{lastBatteryStatus[item.imei]?.CH4?.Ampere}</b>
                  </>
                )}
              </>
            ) : (
              "--"
            ),
            "Battery Interval": batInterval[item.imei]?.batteryStatusInterval,
            "Device Interval": batInterval[item.imei]?.deviceStatusInterval,
            Imei: item.imei,
            Operator: item.lastGatewayStatus?.operator,
            "Số sim": item.simNumber,
            RSSI: item.lastGatewayStatus?.RSSI,
            Action: <Button onClick={() => navigate(`/device/${item.imei}`)}>Detail</Button>,
          }
        })}
        columns={columns.map((item, index) => ({
          title: item,
          dataIndex: item,
          key: item,
          fixed: index < 4 ? "left" : undefined,
        }))}
        scroll={{ x: "max-content" }}
      />
    </Card>
  )
}

export default HomePage
