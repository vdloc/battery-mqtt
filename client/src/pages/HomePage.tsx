import { useSocket } from "@/components/SocketProvider"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import { Permissions } from "@/types/serverTypes"
import { cn } from "@/utils/utils"
import { Button, Card, Input, Table, Tag } from "antd"
import { time } from "drizzle-orm/mysql-core"
import { useEffect, useMemo, useRef, useState } from "react"
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
]
const HomePage = () => {
  const [deviceSetupChannelsStatus, setDeviceSetupChannelsStatus] = useState<any>({})
  const [search, setSearch] = useState("")
  const { data: deviceSetupChannels } = useGetDeviceSetupChannels()
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const [lastGatewayStatus, setLastGatewayStatus] = useState<any>({})
  const [lastBatteryStatus, setLastBatteryStatus] = useState<any>({})
  const [batInterval, setBatInterval] = useState<any>({})
  const { data: devices } = useGetDevices()
  const { data: intervals } = useGetIntervals()
  const [now, setNow] = useState(new Date().getTime())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().getTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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
        [messages.imei]: {
          ...messages.info,
          time: messages.time,
        },
      }))
    }
    if (messages && messages?.operator === "SendBatteryStatus") {
      setLastBatteryStatus((prevStatus: any) => ({
        ...prevStatus,
        [messages.imei]: {
          ...messages.infor,
          time: messages.time,
        },
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
  useCheckPermissions([Permissions.DEVICE_VIEW], "/login")

  return (
    <Card
      title={<p className="text-2xl font-bold">Danh sách thiết bị</p>}
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
            Stt: item.index + 1,
            "Đơn vị": item.manageUnitName,
            "Mã trạm": <Link to={`/device/${item.imei}`}>{item.stationCode}</Link>,
            "Tên gợi nhớ": item.aliasName,
            "Trạng thái gateway":
              now - lastGatewayStatus[item.imei]?.time > 3 * batInterval[item.imei]?.batteryStatusInterval * 1000 ? (
                <Tag color="error">Offline</Tag>
              ) : (
                <Tag color="success">Online</Tag>
              ),
            Volt: (
              <>
                <p>
                  {channelsStatus?.[0] === "1" && (
                    <b className="block">
                      CH1: <Text>{lastBatteryStatus[item.imei]?.CH1?.Voltage?.toFixed(2)}</Text>
                    </b>
                  )}
                  {channelsStatus?.[1] === "1" && (
                    <>
                      {channelsStatus?.[0] === "1" && "/"}{" "}
                      <b className="block">
                        CH2: <Text>{lastBatteryStatus[item.imei]?.CH2?.Voltage?.toFixed(2)}</Text>
                      </b>
                    </>
                  )}
                  {channelsStatus?.[2] === "1" && (
                    <>
                      {channelsStatus?.[1] === "1" && "/"}
                      <b className="block">
                        CH3: <Text>{lastBatteryStatus[item.imei]?.CH3?.Voltage?.toFixed(2)}</Text>
                      </b>
                    </>
                  )}
                  {channelsStatus?.[3] === "1" && (
                    <>
                      {channelsStatus?.[2] === "1" && "/"}
                      <b className="block">
                        CH4: <Text>{lastBatteryStatus[item.imei]?.CH4?.Voltage?.toFixed(2)}</Text>
                      </b>
                    </>
                  )}
                </p>
              </>
            ),
            Ampe: channelsStatus ? (
              <>
                <p>
                  {channelsStatus?.[0] === "1" && (
                    <b className="block">
                      CH1: <Text>{lastBatteryStatus[item.imei]?.CH1?.Ampere?.toFixed(2)}</Text>
                    </b>
                  )}
                  {channelsStatus?.[1] === "1" && (
                    <>
                      {channelsStatus?.[0] === "1" && "/"}{" "}
                      <b className="block">
                        CH2: <Text>{lastBatteryStatus[item.imei]?.CH2?.Ampere?.toFixed(2)}</Text>
                      </b>
                    </>
                  )}
                  {channelsStatus?.[2] === "1" && (
                    <>
                      {channelsStatus?.[1] === "1" && "/"}
                      <b className="block">
                        CH3: <Text>{lastBatteryStatus[item.imei]?.CH3?.Ampere?.toFixed(2)}</Text>
                      </b>
                    </>
                  )}
                  {channelsStatus?.[3] === "1" && (
                    <>
                      {channelsStatus?.[2] === "1" && "/"}
                      <b className="block">
                        CH4: <Text>{lastBatteryStatus[item.imei]?.CH4?.Ampere?.toFixed(2)}</Text>
                      </b>
                    </>
                  )}
                </p>
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

export const Text = ({ children }: any) => {
  if (!children) {
    return <></>
  }
  return (
    <span className={cn([+children === 0 ? "" : +children > 0 ? "text-green-500" : "text-red-500"])}>{children}</span>
  )
}
