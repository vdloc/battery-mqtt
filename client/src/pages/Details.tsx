import { useEffect, useMemo, useState } from "react"
import { Legend, Tooltip, ComposedChart, ResponsiveContainer, XAxis, YAxis, Area, Line, Brush } from "recharts"
import { useParams } from "react-router"
import { DeviceType } from "./HomePage"
import useGetDevices from "@/hooks/useGetDevices"
import { Button, Card, DatePicker, DatePickerProps, Select } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import useGetDeviceStatus from "@/hooks/useGetDeviceStatus"
import { useSocket } from "@/components/SocketProvider"
import { formatNumber } from "@/utils/formatNumber"
import { formatDateAxis } from "@/utils/formatDate"
import useGetIntervals from "@/hooks/useGetIntervals"
import { cn } from "@/utils/utils"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"

const Details = () => {
  const [zoomDomain, setZoomDomain] = useState({ startIndex: 0, endIndex: 20 })
  const params = useParams()
  const [lastGatewayStatus, setLastGatewayStatus] = useState<any>({})
  const [batInterval, setBatInterval] = useState<any>({})
  const [deviceSetupChannelsStatus, setDeviceSetupChannelsStatus] = useState<any>({})
  const [newData, setNewData] = useState<any>([])
  const [tab, setTab] = useState<string[]>([])
  const { data: intervals } = useGetIntervals()
  const [date, setDate] = useState<Dayjs>(dayjs(new Date()))
  const { data: deviceSetupChannels } = useGetDeviceSetupChannels()
  const { data: devices, isLoading: isLoadingDevices } = useGetDevices()
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const [imei, setImei] = useState<null | string>(null)
  const { data, isLoading } = useGetDeviceStatus({
    imei: imei,
    timeStart: date.startOf("day").toDate().getTime(),
    timeEnd: date.endOf("day").toDate().getTime(),
  })

  useEffect(() => {
    if (params && params.imei) {
      setImei(params.imei)
      setNewData([])
    }
  }, [params])
  const listenDevice: any | null = useMemo(() => {
    if (imei && devices && devices?.base.length > 0) {
      return devices?.base.find((item: DeviceType) => item.imei === params.imei)
    }
    return null
  }, [imei, devices])

  useEffect(() => {
    if (params.imei && connected) {
      sendMessage(JSON.stringify({ operator: "SET_LISTEN_DEVICE", device: [params.imei] }))
    }
    return () => {
      setMessages(null)
    }
  }, [params.imei, connected])

  const onChange: DatePickerProps["onChange"] = (value: Dayjs) => {
    setDate(value)
  }

  useEffect(() => {
    if (deviceSetupChannels) {
      setDeviceSetupChannelsStatus((prevStatus: any) => ({
        ...prevStatus,
        ...deviceSetupChannels.configObj,
      }))
    }
  }, [deviceSetupChannels])

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
    if (messages && messages?.operator === "SetupChannel") {
      setDeviceSetupChannelsStatus((prevStatus: any) => ({
        ...prevStatus,
        [messages.imei]: messages.info,
      }))
    }
    if (
      messages &&
      messages?.operator === "SendBatteryStatus" &&
      messages.infor?.CH1 &&
      messages.infor?.CH2 &&
      messages.infor?.CH3 &&
      messages.infor?.CH4
    ) {
      setNewData((prevData: any) => {
        const resultConfig = [...prevData]
        const resultConfigLatest = resultConfig[resultConfig.length - 1]
        if (!resultConfigLatest || (resultConfigLatest && resultConfigLatest.time !== messages.time)) {
          resultConfig.push(messages)
        }
        return resultConfig
      })
    }
  }, [messages])

  const dataMap = useMemo(() => {
    if (data) {
      return data
        ?.sort((a, b) => a.time - b.time)
        ?.filter((item) => item.infor?.CH1 && item.infor?.CH2 && item.infor?.CH3 && item.infor?.CH4)
        ?.map((item) => {
          return {
            ch1Voltage: +item.infor?.CH1?.Voltage,
            ch1Ampere: +item.infor?.CH1?.Ampere,
            ch2Voltage: +item.infor?.CH2?.Voltage,
            ch2Ampere: +item.infor?.CH2?.Ampere,
            ch3Voltage: +item.infor?.CH3?.Voltage,
            ch3Ampere: +item.infor?.CH3?.Ampere,
            ch4Voltage: +item.infor?.CH4?.Voltage,
            ch4Ampere: +item.infor?.CH4?.Ampere,
            date: formatDateAxis(+item.time),
            time: item.time.toString(),
          }
        })
    }
    return []
  }, [data])

  const dataConfig = useMemo(() => {
    if (newData) {
      return dataMap.concat(
        newData?.map((item: any) => ({
          ch1Voltage: +item.infor?.CH1?.Voltage,
          ch1Ampere: +item.infor?.CH1?.Ampere,
          ch2Voltage: +item.infor?.CH2?.Voltage,
          ch2Ampere: +item.infor?.CH2?.Ampere,
          ch3Voltage: +item.infor?.CH3?.Voltage,
          ch3Ampere: +item.infor?.CH3?.Ampere,
          ch4Voltage: +item.infor?.CH4?.Voltage,
          ch4Ampere: +item.infor?.CH4?.Ampere,
          date: formatDateAxis(+item.time),
          time: item.time.toString(),
        }))
      )
    }
    return []
  }, [dataMap, newData])

  const ticks = useMemo(() => {
    return dataConfig?.length > 5
      ? [
          dataConfig[dataConfig?.length > 5 ? 5 : 0].date,
          dataConfig[Math.floor((dataConfig.length * 1) / 4)].date,
          dataConfig[Math.floor((dataConfig.length * 2) / 4)].date,
          dataConfig[Math.floor((dataConfig.length * 3) / 4)].date,
          dataConfig[dataConfig?.length - 1]?.date,
        ]
      : undefined
  }, [dataConfig])
  const selectTab = (type: string) => {
    const tabClone = [...tab]
    const index = tabClone.indexOf(type)
    if (index >= 0) {
      tabClone.splice(index, 1)
    } else {
      tabClone.push(type)
    }
    setTab(tabClone)
  }

  // useEffect(() => {
  //   if (dataConfig.length > 0) {
  //     setZoomDomain((prevZoom) => {
  //       return {
  //         ...prevZoom,
  //         endIndex: dataConfig.length,
  //       }
  //     })
  //   }
  // }, [dataConfig])

  const channelStatus = useMemo(() => {
    if (imei && deviceSetupChannelsStatus) {
      return deviceSetupChannelsStatus[imei]?.usingChannel
    }
    return null
  }, [deviceSetupChannelsStatus, imei])

  console.log("channelStatus", channelStatus)
  const handleBrushChange = (e: any) => {
    if (e?.startIndex != null && e?.endIndex != null) {
      setZoomDomain({ startIndex: e.startIndex, endIndex: e.endIndex })
    }
  }
  console.log("zoomDomain", zoomDomain)
  return (
    <div className="flex flex-col gap-5">
      <Card
        title={<p className="text-2xl font-bold">Information</p>}
        extra={
          <Select
            value={imei}
            onChange={(value) => setImei(value)}
            options={devices?.base.map((item: any) => ({
              label: `${item?.manageUnitName}-${item?.stationCode}-${item.imei}`,
              value: item.imei,
            }))}
          />
        }
      >
        {isLoadingDevices ? (
          <p>Loading...</p>
        ) : (
          <ul className="flex gap-x-8 text-lg flex-wrap">
            <li>
              Đơn vị: <b>{listenDevice?.manageUnitName}</b>
            </li>
            <li>
              Mã trạm: <b>{listenDevice?.stationCode}</b>
            </li>
            <li>
              Tên gợi nhớ: <b>{listenDevice?.aliasName}</b>
            </li>
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
              RSSI: <b>{listenDevice?.imei && lastGatewayStatus[listenDevice?.imei]?.RSSI}</b>
            </li>
            <li>
              Battery interval: <b>{listenDevice?.imei && batInterval[listenDevice.imei]?.batteryStatusInterval}</b>
            </li>
            <li>
              UsingChannel: <b>{channelStatus}</b>
            </li>
            <li>
              FwVersion: <b>{listenDevice?.lastGatewayStatus.fwVersion}</b>
            </li>
          </ul>
        )}
      </Card>
      <Card
        title={<p className="text-2xl font-bold">Chart</p>}
        extra={
          <div className="flex items-center gap-3">
            <ul className="flex items-center gap-3">
              {channelStatus?.[0] === "1" && (
                <li>
                  <Button
                    type="default"
                    className={cn("!font-bold", [tab.includes("CH1") ? "!border-[#4096ff] !text-[#4096ff]" : ""])}
                    onClick={() => selectTab("CH1")}
                  >
                    CH1
                  </Button>
                </li>
              )}
              {channelStatus?.[1] === "1" && (
                <li>
                  <Button
                    type="default"
                    className={cn("!font-bold", [tab.includes("CH2") ? "!border-[#4096ff] !text-[#4096ff]" : ""])}
                    onClick={() => selectTab("CH2")}
                  >
                    CH2
                  </Button>
                </li>
              )}
              {channelStatus?.[2] === "1" && (
                <li>
                  <Button
                    type="default"
                    className={cn("!font-bold", [tab.includes("CH3") ? "!border-[#4096ff] !text-[#4096ff]" : ""])}
                    onClick={() => selectTab("CH3")}
                  >
                    CH3
                  </Button>
                </li>
              )}
              {channelStatus?.[3] === "1" && (
                <li>
                  <Button
                    type="default"
                    className={cn("!font-bold", [tab.includes("CH4") ? "!border-[#4096ff] !text-[#4096ff]" : ""])}
                    onClick={() => selectTab("CH4")}
                  >
                    CH4
                  </Button>
                </li>
              )}
            </ul>
            <DatePicker value={date} onChange={onChange} />
          </div>
        }
      >
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1">
            <div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[...dataConfig]}
                    // margin={{
                    //   right: width > 500 ? 30 : 10,
                    //   top: width > 500 ? 20 : 10,
                    //   bottom: 10,
                    // }}
                  >
                    <defs>
                      <linearGradient id="gradientColor3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="20%" stopColor="#82ca9d" stopOpacity={0} />
                        <stop offset="100%" stopColor="#82ca9d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <defs>
                      <linearGradient id="gradientColor4" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="orange" stopOpacity={0.8} />
                        <stop offset="20%" stopColor="orange" stopOpacity={0} />
                        <stop offset="100%" stopColor="orange" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      ticks={ticks}
                      fontSize={13}
                      tickMargin={5}
                      tickLine={false}
                      padding="gap"
                      tick={formatXAxis}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      fontSize={13}
                      axisLine={true}
                      tickFormatter={formatYAxis}
                      tickLine={false}
                      padding={{
                        top: 10,
                      }}
                      // yAxisId="right" orientation="left" axisLine={false} tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={13}
                      axisLine={true}
                      tickFormatter={formatYAxis}
                      tickLine={false}
                      padding={{
                        top: 10,
                      }}
                      // yAxisId="right" orientation="left" axisLine={false} tickFormatter={(value) => `$${value}`}
                    />
                    <Legend />

                    {(tab.includes("CH1") || tab.length === 0) && channelStatus?.[0] === "1" && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ch1Voltage"
                        stroke="#00c951"
                        name="CH1 Voltage"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(tab.includes("CH1") || tab.length === 0) && channelStatus?.[0] === "1" && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ch1Ampere"
                        stroke="#ff6900"
                        name="CH1 Ampere"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(tab.includes("CH2") || tab.length === 0) && channelStatus?.[1] === "1" && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ch1Voltage"
                        stroke="#00c951"
                        name="CH1 Voltage"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(tab.includes("CH2") || tab.length === 0) && channelStatus?.[1] === "1" && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ch2Ampere"
                        stroke="#f54a00"
                        name="CH2 Ampere"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(tab.includes("CH3") || tab.length === 0) && channelStatus?.[2] === "1" && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ch3Voltage"
                        stroke="#008236"
                        name="CH3 Voltage"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(tab.includes("CH3") || tab.length === 0) && channelStatus?.[2] === "1" && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ch3Ampere"
                        stroke="#ca3500"
                        name="CH3 Ampere"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(tab.includes("CH4") || tab.length === 0) && channelStatus?.[3] === "1" && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ch4Voltage"
                        stroke="#016630"
                        name="CH4 Voltage"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(tab.includes("CH4") || tab.length === 0) && channelStatus?.[3] === "1" && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ch4Ampere"
                        stroke="#9f2d00"
                        name="CH4 Ampere"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}

                    {/* <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="ch1Ampere"
                        stroke="#82ca9d"
                        name="CH1 Ampere"
                        strokeWidth={2}
                        fill="url(#gradientColor3)"
                      /> */}
                    {/* <Brush
                      dataKey="name"
                      height={20}
                      stroke="#8884d8"
                      startIndex={zoomDomain.startIndex}
                      endIndex={zoomDomain.endIndex}
                      onChange={handleBrushChange}
                      travellerWidth={10}
                    /> */}
                    <Tooltip
                      content={(props) => {
                        const { active, payload, label } = props
                        if (active && payload && payload?.length) {
                          return (
                            <div className=" bg-[#fff] rounded-[8px] border p-3">
                              <p className="font-bold text-black">Time: {label}</p>
                              <div className="grid grid-cols-2 gap-1">
                                {payload?.map((item, index: number) => {
                                  return (
                                    <p
                                      className=""
                                      key={index}
                                      style={{
                                        color: item.color,
                                      }}
                                    >
                                      {item.name}: <b className="">{formatNumber(item.value, 0)}</b>
                                    </p>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        }

                        return null
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Details

const formatYAxis = (tick: any) => {
  if (tick >= 1e9) return `$${tick / 1e9}B` // Billions
  if (tick >= 1e6) return `$${tick / 1e6}M` // Millions
  if (tick >= 1e3) return `$${tick / 1e3}K` // Thousands
  if (tick <= -1e9) return `-$${(tick * -1) / 1e9}B` // Billions
  if (tick <= -1e6) return `-$${(tick * -1) / 1e6}M` // Millions
  if (tick <= -1e3) return `-$${(tick * -1) / 1e3}K` // Thousands
  return tick
}

const formatXAxis = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${0},${0})`}>
      <text x={x} y={y} dy={8} dx={20} fontSize={13} textAnchor="end" fill="#666">
        {payload.value}
      </text>
    </g>
  )
}
