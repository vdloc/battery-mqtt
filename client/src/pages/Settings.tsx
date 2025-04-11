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
  const { isPending, mutateAsync } = usePostRequest()
  const [choseItem, setChoseItem] = useState<any>(null)
  const { data: deviceSetupChannels } = useGetDeviceSetupChannels()
  const { data: devices } = useGetDevices()
  const { data: intervals } = useGetIntervals()
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>()

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

  console.log("choseItem", choseItem)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { BatteryStatusInterval, DeviceStatusInterval, usingChannel } = data
    const bodyData = {
      imei: chosedItemConfig.imei,
      operator: chosedItemConfig?.lastGatewayStatus.operator,
      infor: {
        BatteryStatusInterval: +BatteryStatusInterval,
        DeviceStatusInterval: +DeviceStatusInterval,
        usingChannel,
      },
      time: Date.now(),
    }
    try {
      await mutateAsync(bodyData)
    } catch (error: any) {
      console.log("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[500px] mx-auto">
      <Card title={<p className="text-2xl font-bold">Settings</p>}>
        {deviceSetupChannels ? (
          <div>
            <div className="mb-4">
              <label className="font-bold">Device</label>
              <Select
                className="w-full"
                value={choseItem}
                onChange={(value) => setChoseItem(value)}
                options={options}
              />
            </div>
            <div className="flex flex-col gap-3">
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
              <div>
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
            </div>
            <div className="mt-5">
              <Button
                disabled={isPending}
                size="large"
                className="w-full font-bold"
                type="primary"
                onClick={handleSubmit(onSubmit)}
              >
                {isPending ? "Confirming..." : "Confirm"}
              </Button>
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
