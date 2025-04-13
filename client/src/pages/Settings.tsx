import { useSocket } from "@/components/SocketProvider"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import usePostRequest from "@/hooks/usePostRequest"
import { Button, Card, Input, Select } from "antd"
import { useEffect, useMemo, useState } from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import toast from "react-hot-toast"

type Inputs = {
  BatteryStatusInterval: string | number
  DeviceStatusInterval: string | number
  usingChannel: string | number
}
const Settings = () => {
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const { isPending, mutateAsync } = usePostRequest()
  const [choseItem, setChoseItem] = useState<any>(null)
  const { data: deviceSetupChannels, refetch: refetchChannel } = useGetDeviceSetupChannels()
  const { data: devices } = useGetDevices()
  const { data: intervals, refetch: refetchInterval } = useGetIntervals()
  const [typeSubmit, setTypeSubmit] = useState<string | null>()
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>()

  useEffect(() => {
    if (devices && connected) {
      sendMessage(JSON.stringify({ operator: "SET_LISTEN_DEVICE", device: devices.base.map((item: any) => item.imei) }))
    }
    return () => {
      setMessages(null)
    }
  }, [connected, sendMessage, devices])

  useEffect(() => {
    if (messages && messages?.operator === "SetInterval") {
      toast.success(`Cập nhật interval cho imei ${messages.imei} thành công`)
      refetchChannel()
    }
    if (messages && messages?.operator === "SetupChannel") {
      toast.success(`Cập nhật channel cho imei ${messages.imei} thành công`)
      refetchInterval()
    }
  }, [messages])

  const options = useMemo(() => {
    if (deviceSetupChannels && devices) {
      return deviceSetupChannels.base.map((item: any) => ({
        label: `${devices?.configObj[item.imei]?.lastGatewayStatus?.operator} - ${item.imei}`,
        value: item.imei,
      }))
    }
    return []
  }, [deviceSetupChannels, devices])

  useEffect(() => {
    if (!choseItem && options?.length > 0) {
      setChoseItem(options[0].value)
    }
  }, [options, choseItem])

  const chosedItemConfig = useMemo(() => {
    if (choseItem && deviceSetupChannels) {
      return {
        ...devices?.configObj[choseItem],
        ...deviceSetupChannels?.configObj[choseItem],
        ...intervals?.configObj[choseItem],
      }
    }

    return null
  }, [choseItem, deviceSetupChannels, intervals])

  useEffect(() => {
    if (!!chosedItemConfig) {
      setValue("BatteryStatusInterval", chosedItemConfig.batteryStatusInterval)
      setValue("DeviceStatusInterval", chosedItemConfig.deviceStatusInterval)
      setValue("usingChannel", chosedItemConfig.usingChannel)
    }
  }, [chosedItemConfig])

  const onSubmitInterval: SubmitHandler<Inputs> = async (data) => {
    const { BatteryStatusInterval, DeviceStatusInterval } = data
    setTypeSubmit("interval")
    const bodyData = {
      imei: chosedItemConfig.imei,
      operator: "SetInterval",
      infor: {
        BatteryStatusInterval: +BatteryStatusInterval,
        DeviceStatusInterval: +DeviceStatusInterval,
      },
      time: Date.now(),
    }
    try {
      await mutateAsync(bodyData)
      toast.success("Gửi yêu cầu cập nhật intervals thành công!")
    } catch (error: any) {
      console.log("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }

  const onSubmitChannel: SubmitHandler<Inputs> = async (data) => {
    setTypeSubmit("channel")
    const { usingChannel } = data
    const bodyData = {
      imei: chosedItemConfig.imei,
      operator: "SetupChannel",
      infor: {
        usingChannel,
      },
      time: Date.now(),
    }
    try {
      await mutateAsync(bodyData)
      toast.success("Gửi yêu cầu cập nhật channel thành công!")
    } catch (error: any) {
      console.log("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[600px] mx-auto">
      <Card title={<p className="text-2xl font-bold">Settings</p>}>
        {deviceSetupChannels ? (
          <div>
            <div className="mb-4">
              <label className="font-bold block">Device</label>
              <Select
                showSearch
                className="w-full block"
                value={choseItem}
                onChange={(value) => setChoseItem(value)}
                options={options}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 py-3 my-3 border-y border-gray-200">
              <div>
                <label className="font-bold">Battery Status Interval</label>
                <Controller
                  name="BatteryStatusInterval"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => <Input {...field} placeholder="Device Status Interval" />}
                />
                {errors.BatteryStatusInterval && <span>This field is required</span>}
              </div>
              <div>
                <label className="font-bold">Device Status Interval</label>
                <Controller
                  name="DeviceStatusInterval"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => <Input {...field} placeholder="Device Status Interval" />}
                />

                {errors.DeviceStatusInterval && <span>This field is required</span>}
              </div>
              <div className="mt-5">
                <Button
                  disabled={isPending && typeSubmit === "interval"}
                  size="large"
                  className="w-full !font-bold"
                  type="primary"
                  onClick={handleSubmit(onSubmitInterval)}
                >
                  {isPending && typeSubmit === "interval" ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="font-bold">Using Channel</label>
                <Controller
                  name="usingChannel"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => <Input {...field} placeholder="Device Status Interval" />}
                />
                {errors.usingChannel && <span>This field is required</span>}
              </div>
              <div className="mt-5">
                <Button
                  disabled={isPending && typeSubmit === "channel"}
                  size="large"
                  className="w-full !font-bold"
                  type="primary"
                  onClick={handleSubmit(onSubmitChannel)}
                >
                  {isPending && typeSubmit === "channel" ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Card>
    </div>
  )
}

export default Settings
