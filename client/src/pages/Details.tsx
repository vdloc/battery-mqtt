import { useEffect, useMemo, useState } from "react"
import React, { useLayoutEffect, useRef } from "react"
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { useParams } from "react-router"
import { DeviceType } from "./HomePage"
import useGetDevices from "@/hooks/useGetDevices"
import { Button, Card, DatePicker, DatePickerProps, Select } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import useGetDeviceStatus from "@/hooks/useGetDeviceStatus"
import { useSocket } from "@/components/SocketProvider"

import { formatDateAxis } from "@/utils/formatDate"
import useGetIntervals from "@/hooks/useGetIntervals"
import { cn } from "@/utils/utils"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"

const Details = () => {
  const params = useParams()
  const [lastGatewayStatus, setLastGatewayStatus] = useState<any>({})
  const [batInterval, setBatInterval] = useState<any>({})
  const [deviceSetupChannelsStatus, setDeviceSetupChannelsStatus] = useState<any>({})
  const [newData, setNewData] = useState<any>(null)
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
      setNewData(null)
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
        if (!prevData || prevData.time !== messages.time) {
          return messages
        }
        return prevData
      })
    }
  }, [messages])

  const dataConfig = useMemo(() => {
    if (data) {
      return data

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
            label: formatDateAxis(+item.time),
            time: item.time.toString(),
          }
        })
    }
    return []
  }, [data])

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

  const channelStatus = useMemo(() => {
    if (imei && deviceSetupChannelsStatus) {
      return deviceSetupChannelsStatus[imei]?.usingChannel
    }
    return null
  }, [deviceSetupChannelsStatus, imei])

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
                <Chart data={dataConfig} newData={newData} />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Details

const Chart = ({ data, newData }: any) => {
  const chartRef = useRef<any>(null)

  const seriesV1 = useRef<any>(null)
  const seriesV2 = useRef<any>(null)
  const seriesV3 = useRef<any>(null)
  const seriesV4 = useRef<any>(null)
  const seriesA1 = useRef<any>(null)
  const seriesA2 = useRef<any>(null)
  const seriesA3 = useRef<any>(null)
  const seriesA4 = useRef<any>(null)

  console.log("data", data)

  useEffect(() => {
    const root = am5.Root.new(chartRef.current)
    root?._logo?.dispose()

    const myTheme = am5.Theme.new(root)

    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy: 1,
    })

    myTheme.rule("Grid", ["x"]).setAll({
      strokeOpacity: 0.05,
    })

    myTheme.rule("Grid", ["x", "minor"]).setAll({
      strokeOpacity: 0.05,
    })

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root), myTheme])

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        maxTooltipDistance: 0,
        pinchZoomX: true,
      })
    )

    let date = new Date()
    date.setHours(0, 0, 0, 0)
    let value = 100

    function generateData() {
      value = Math.round(Math.random() * 10 - 4.2 + value)
      am5.time.add(date, "day", 1)
      return {
        date: date.getTime(),
        value: value,
      }
    }

    function generateDatas(count: any) {
      let data = []
      for (var i = 0; i < count; ++i) {
        data.push(generateData())
      }
      return data
    }

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: "day",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    )

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    )

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    for (var i = 0; i < 10; i++) {
      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: "Series " + i,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          legendValueText: "{valueY}",
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{valueY}",
          }),
        })
      )

      date = new Date()
      date.setHours(0, 0, 0, 0)
      value = 0

      let data = generateDatas(100)
      series.data.setAll(data)

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear()
    }

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    )
    cursor.lineY.set("visible", false)

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    )

    chart.set(
      "scrollbarY",
      am5.Scrollbar.new(root, {
        orientation: "vertical",
      })
    )

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    let legend = chart.rightAxesContainer.children.push(
      am5.Legend.new(root, {
        width: 200,
        paddingLeft: 15,
        height: am5.percent(100),
      })
    )

    // When legend item container is hovered, dim all the series except the hovered one
    legend.itemContainers.template.events.on("pointerover", function (e) {
      let itemContainer = e.target

      // As series list is data of a legend, dataContext is series
      let series = itemContainer?.dataItem?.dataContext

      chart.series.each(function (chartSeries: any) {
        if (chartSeries != series) {
          chartSeries?.strokes?.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000),
          })
        } else {
          chartSeries?.strokes?.template.setAll({
            strokeWidth: 3,
          })
        }
      })
    })

    // When legend item container is unhovered, make all series as they are
    legend.itemContainers.template.events.on("pointerout", function (e) {
      let itemContainer = e.target
      let series = itemContainer?.dataItem?.dataContext

      chart.series.each(function (chartSeries: any) {
        chartSeries?.strokes?.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get("fill"),
        })
      })
    })

    legend.itemContainers.template.set("width", am5.p100)
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right",
    })

    // It's is important to set legend data after all the events are set on template, otherwise events won't be copied
    legend.data.setAll(chart.series.values)

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100)
    return () => {
      root.dispose()
    }
  }, [data])

  useEffect(() => {
    if (newData) {
      const dataPush = {
        ch1Voltage: +newData.infor?.CH1?.Voltage,
        ch1Ampere: +newData.infor?.CH1?.Ampere,
        ch2Voltage: +newData.infor?.CH2?.Voltage,
        ch2Ampere: +newData.infor?.CH2?.Ampere,
        ch3Voltage: +newData.infor?.CH3?.Voltage,
        ch3Ampere: +newData.infor?.CH3?.Ampere,
        ch4Voltage: +newData.infor?.CH4?.Voltage,
        ch4Ampere: +newData.infor?.CH4?.Ampere,
        label: formatDateAxis(+newData.time),
        time: newData.time.toString(),
      }
      seriesV1.current?.data.push(dataPush)
      seriesA1.current?.data.push(dataPush)
    }
  }, [newData])

  return <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "400px" }} />
}
