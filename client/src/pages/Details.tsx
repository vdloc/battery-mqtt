import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { DeviceType } from "./HomePage"
import useWebSocket from "@/hooks/useWebSocket"
import useGetDevices from "@/hooks/useGetDevices"
import { Card, DatePicker, DatePickerProps } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import useGetDeviceStatus from "@/hooks/useGetDeviceStatus"

const wsUrl = import.meta.env.VITE_WS_URL
const Details = () => {
  const params = useParams()
  const [date, setDate] = useState<Dayjs>(dayjs())
  const { data: devices } = useGetDevices()
  const { messages, sendMessage, connected, disconnected, error } = useWebSocket(wsUrl)
  const { data } = useGetDeviceStatus({
    imei: params.imei,
    timeStart: date.startOf("day").toDate().getTime(),
    timeEnd: date.endOf("day").toDate().getTime(),
  })
  console.log("data", data)
  const listenDevice: DeviceType | null = useMemo(() => {
    if (params && params.imei && devices && devices?.base.length > 0) {
      return devices?.base.find((item: DeviceType) => item.imei === params.imei)
    }
    return null
  }, [params, devices])

  useEffect(() => {
    if (listenDevice && connected) {
      console.log("listenDevice", listenDevice)
      sendMessage(JSON.stringify({ operator: "SET_LISTEN_DEVICE", device: listenDevice }))
    }
  }, [listenDevice, connected])
  console.log("messages", messages)
  console.log("connected", connected)
  console.log("error", error)
  const onChange: DatePickerProps["onChange"] = (value: Dayjs) => {
    setDate(value)
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title={<p className="text-2xl font-bold">Information</p>}>
        <ul className="flex gap-8 text-lg">
          <li>
            0perator: <b>{listenDevice?.lastGatewayStatus.operator}</b>
          </li>
          <li>
            Imei: <b>{listenDevice?.imei}</b>
          </li>
          <li>
            IP: <b>{listenDevice?.lastGatewayStatus.IP}</b>
          </li>
          <li>
            RSSI: <b>{listenDevice?.lastGatewayStatus.RSSI}</b>
          </li>
          <li>
            UsingChannel: <b>{listenDevice?.lastGatewayStatus.usingChannel}</b>
          </li>
          <li>
            FwVersion: <b>{listenDevice?.lastGatewayStatus.fwVersion}</b>
          </li>
        </ul>
      </Card>
      <Card title={<p className="text-2xl font-bold">Chart</p>} extra={<DatePicker onChange={onChange} />}>
        <ul className="flex gap-8 text-lg">
          <li>
            0perator: <b>{listenDevice?.lastGatewayStatus.operator}</b>
          </li>
          <li>
            Imei: <b>{listenDevice?.imei}</b>
          </li>
          <li>
            IP: <b>{listenDevice?.lastGatewayStatus.IP}</b>
          </li>
          <li>
            RSSI: <b>{listenDevice?.lastGatewayStatus.RSSI}</b>
          </li>
          <li>
            UsingChannel: <b>{listenDevice?.lastGatewayStatus.usingChannel}</b>
          </li>
          <li>
            FwVersion: <b>{listenDevice?.lastGatewayStatus.fwVersion}</b>
          </li>
        </ul>
      </Card>
    </div>
  )
}

export default Details
