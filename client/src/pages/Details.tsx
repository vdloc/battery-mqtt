import { useEffect, useMemo, useState } from "react"
import React, { useLayoutEffect, useRef } from "react"
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { useParams } from "react-router"
import { DeviceType } from "./HomePage"
import useGetDevices from "@/hooks/useGetDevices"
import { Card, DatePicker, Select } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import useGetDeviceStatus from "@/hooks/useGetDeviceStatus"
import { useSocket } from "@/components/SocketProvider"

import { formatDateAxis } from "@/utils/formatDate"
import useGetIntervals from "@/hooks/useGetIntervals"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"

const Details = () => {
  const params = useParams()
  const [lastGatewayStatus, setLastGatewayStatus] = useState<any>({})
  const [batInterval, setBatInterval] = useState<any>({})
  const [deviceSetupChannelsStatus, setDeviceSetupChannelsStatus] = useState<any>({})
  const [newData, setNewData] = useState<any>(null)
  const { data: intervals } = useGetIntervals()
  const [startTime, setStartTime] = useState<Dayjs>(dayjs(new Date()).startOf("day"))
  const [endTime, setEndTime] = useState<Dayjs>(dayjs(new Date()).endOf("day"))
  const { data: deviceSetupChannels } = useGetDeviceSetupChannels()
  const { data: devices, isLoading: isLoadingDevices } = useGetDevices()
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const [imei, setImei] = useState<null | string>(null)
  const { data, isLoading } = useGetDeviceStatus({
    imei: imei,
    timeStart: startTime.toDate().getTime(),
    timeEnd: endTime.toDate().getTime(),
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

  const onChange: any = ([valueStart, valueEnd]: any) => {
    setMessages(null)
    setStartTime(valueStart)
    setEndTime(valueEnd)
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
  }, [messages])
  useEffect(() => {
    if (
      messages &&
      messages?.operator === "SendBatteryStatus" &&
      messages.infor?.CH1 &&
      messages.infor?.CH2 &&
      messages.infor?.CH3 &&
      messages.infor?.CH4 &&
      +messages.time < endTime.toDate().getTime()
    ) {
      setNewData((prevData: any) => {
        if (!prevData || prevData.time !== messages.time) {
          return messages
        }
        return prevData
      })
    }
  }, [messages, endTime])

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
            time: +item.time,
          }
        })
        .sort((a, b) => a.time - b.time)
    }
    return []
  }, [data])

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
              0perator: <b>{listenDevice?.lastGatewayStatus?.operator}</b>
            </li>
            <li>
              Imei: <b>{listenDevice?.imei}</b>
            </li>
            <li>
              IP: <b>{listenDevice?.lastGatewayStatus?.IP}</b>
            </li>
            <li>
              RSSI: <b>{listenDevice?.imei && lastGatewayStatus?.[listenDevice?.imei]?.RSSI}</b>
            </li>
            <li>
              Battery interval: <b>{listenDevice?.imei && batInterval[listenDevice.imei]?.batteryStatusInterval}</b>
            </li>
            <li>
              UsingChannel: <b>{channelStatus}</b>
            </li>
            <li>
              FwVersion: <b>{listenDevice?.lastGatewayStatus?.fwVersion}</b>
            </li>
          </ul>
        )}
      </Card>
      <Card
        title={<p className="text-2xl font-bold">Chart</p>}
        extra={
          <div className="flex items-center gap-3">
            <DatePicker.RangePicker showTime defaultValue={[startTime, endTime]} onChange={onChange} />
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

const colorsHot = ["#ff0000", "#ffa500", "#FF6347", "#eb2f96"]
const colorsCold = ["#0000ff", "#008080", "#6cff00", "#008000"]
const colors = [...colorsHot, ...colorsCold]
const Chart = ({ data, newData }: any) => {
  const chartRef = useRef<any>(null)
  console.log("data", data)
  const seriesList = useRef<any>([])

  useEffect(() => {
    const root = am5.Root.new(chartRef.current)
    root?._logo?.dispose()

    const myTheme = am5.Theme.new(root)

    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy: 1,
    })

    myTheme.rule("Grid", ["x"]).setAll({
      strokeOpacity: 0,
    })
    myTheme.rule("Grid", ["y"]).setAll({
      strokeOpacity: 0,
    })

    myTheme.rule("Grid", ["y", "minor"]).setAll({
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
        tooltip: am5.Tooltip.new(root, {
          labelText: `[bold]{name}[/]\n{valueY} at {valueX.formatDate('HH:mm:ss')}`,
        }),
      })
    )

    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
    })
    xRenderer.labels.template.set("minPosition", 0.01)
    xRenderer.labels.template.set("maxPosition", 0.99)

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: {
          timeUnit: "second",
          count: 30,
        },
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    )

    let yAxis1 = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    )
    let yAxis2 = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          opposite: true,
        }),
      })
    )
    yAxis1.get("renderer").grid.template.set("visible", false)
    yAxis2.get("renderer").grid.template.set("visible", false)

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    for (var i = 1; i < 9; i++) {
      const label = i < 5 ? "Voltage" : "Ampere"
      const name = `CH${i < 5 ? i : i - 4} ${label}`
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: i < 5 ? yAxis1 : yAxis2,
          valueYField: `ch${i < 5 ? i : i - 4}${label}`,
          valueXField: "time",
          legendValueText: "{valueY}",
          fill: am5.color(colors[i - 1]),
          stroke: am5.color(colors[i - 1]),
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{valueY}",
          }),
        })
      )
      series.data.setAll(data)
      seriesList.current[i - 1] = series

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
    }

    var tooltip = chart.set("tooltip", am5.Tooltip.new(root, {}))
    tooltip.label.set("text", "{valueY}")

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
        time: +newData.time,
      }
      for (var i = 1; i < 9; i++) {
        seriesList.current[i - 1].data.push(dataPush)
      }
    }
  }, [newData])

  return (
    <>
      <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "400px" }} />
    </>
  )
}
