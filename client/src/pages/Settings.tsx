import { useSocket } from "@/components/SocketProvider"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import usePostRequest from "@/hooks/usePostRequest"
import { Button, Card, Input, Modal, Select, Table } from "antd"
import { useEffect, useMemo, useState } from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import toast from "react-hot-toast"

const columns = [
  "Stt",
  "Đơn vị",
  "Mã trạm",
  "Tên gợi nhớ",
  "Using Channel",
  "Battery Status Interval",
  "Device Status Interval",
  "Action",
]

type Inputs = {
  BatteryStatusInterval: string | number
  DeviceStatusInterval: string | number
  usingChannel: string | number
}
const Settings = () => {
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { messages, sendMessage, connected, setMessages } = useSocket()

  const [choseItem, setChoseItem] = useState<any>(null)
  const { data: deviceSetupChannels, refetch: refetchChannel } = useGetDeviceSetupChannels()
  const { data: devices } = useGetDevices()
  const { data: intervals, refetch: refetchInterval } = useGetIntervals()

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
      toast.success(`Interval của imei ${messages.imei} đã được cập nhật`)
      refetchInterval()
    }
    if (messages && messages?.operator === "SetupChannel") {
      toast.success(`Channel của imei ${messages.imei} đã được cập nhật`)
      refetchChannel()
    }
  }, [messages])

  const dataToShow = useMemo(() => {
    if (deviceSetupChannels && devices && intervals) {
      return devices.base.map((item: any) => ({
        ...item,
        usingChannel: deviceSetupChannels.configObj[item.imei],
        intervals: intervals.configObj[item.imei],
      }))
    }
    return []
  }, [deviceSetupChannels, devices, intervals])

  const dataToFilter = useMemo(() => {
    if (search) {
      return dataToShow.filter(
        (item: any) =>
          item.aliasName.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.imei.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.simNumber.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.stationCode.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.manageUnitName.toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
    }
    return dataToShow
  }, [search, dataToShow])

  return (
    <div className="flex flex-col gap-5  mx-auto">
      <Card
        title={<p className="text-2xl font-bold">Settings</p>}
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
          dataSource={dataToFilter?.map((item: any, index: number) => {
            return {
              key: index + 1,
              Stt: item.index,
              "Đơn vị": item.manageUnitName,
              "Mã trạm": item.stationCode,
              "Tên gợi nhớ": item.aliasName,
              "Using Channel": item.usingChannel.usingChannel,
              "Battery Status Interval": item.intervals?.batteryStatusInterval,
              "Device Status Interval": item.intervals?.deviceStatusInterval,
              Action: (
                <Button
                  onClick={() => {
                    setIsModalOpen(true)
                    setChoseItem(item)
                  }}
                >
                  Setting
                </Button>
              ),
            }
          })}
          columns={columns.map((item) => ({
            title: item,
            dataIndex: item,
            key: item,
          }))}
        />
      </Card>

      <Modal
        title="Settings"
        open={isModalOpen}
        footer={null}
        closable
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <ModalSetting choseItem={choseItem} />
      </Modal>
    </div>
  )
}

export default Settings

const ModalSetting = ({ choseItem }: any) => {
  console.log("choseItem", choseItem)
  const { isPending, mutateAsync } = usePostRequest()
  const [typeSubmit, setTypeSubmit] = useState<string | null>()
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>()

  useEffect(() => {
    if (!!choseItem) {
      setValue("BatteryStatusInterval", choseItem?.intervals?.batteryStatusInterval)
      setValue("DeviceStatusInterval", choseItem?.intervals?.deviceStatusInterval)
      setValue("usingChannel", choseItem.usingChannel?.usingChannel)
    }
  }, [choseItem])

  const onSubmitInterval: SubmitHandler<Inputs> = async (data) => {
    const { BatteryStatusInterval, DeviceStatusInterval } = data
    setTypeSubmit("interval")
    const bodyData = {
      imei: choseItem.imei,
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
      imei: choseItem.imei,
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
    <div>
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
  )
}
