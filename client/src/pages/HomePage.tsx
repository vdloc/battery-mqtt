import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import { Button, Card, Table } from "antd"
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

const columns = ["Imei", "Operator", "Ip", "Channel", "RSSI", "Volt", "Ampe", "Action"]
const HomePage = () => {
  const navigate = useNavigate()
  const { data: devices } = useGetDevices()
  const { data: intervals } = useGetIntervals()
  const { data: deviceSetupChannels } = useGetDeviceSetupChannels()
  console.log("devices", devices)
  console.log("intervals", intervals)
  console.log("deviceSetupChannels", deviceSetupChannels)
  return (
    <Card title={<p className="text-2xl font-bold">List Devices</p>}>
      <Table
        // pagination={{
        //   pageSize: 50,
        // }}
        dataSource={devices?.base?.map((item: any, index: number) => {
          return {
            key: index,
            Imei: item.imei,
            Operator: item.lastGatewayStatus?.operator,
            Ip: item.lastGatewayStatus.IP,
            Channel: item.lastGatewayStatus.usingChannel,
            RSSI: item.lastGatewayStatus.RSSI,
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
