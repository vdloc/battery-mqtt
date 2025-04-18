import { useSocket } from "@/components/SocketProvider"
import { TEXT_REQUIRED } from "@/constants"
import usePostDevices, { DeviceType } from "@/hooks/devices/usePostDevices"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import useGetManageUnits from "@/hooks/useGetManageUnits"
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

const Settings = () => {
  const [modalType, setModalType] = useState<string>("update")
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const [choseItem, setChoseItem] = useState<any>(null)
  const { data: deviceSetupChannels, refetch: refetchChannel } = useGetDeviceSetupChannels()
  const { data: devices, refetch } = useGetDevices()
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
        <div className="flex mb-3 justify-end">
          <Button
            type="primary"
            onClick={() => {
              setIsModalOpen(true)
              setChoseItem(null)
            }}
          >
            Tạo mới
          </Button>
        </div>
        <Table
          dataSource={dataToFilter?.map((item: any, index: number) => {
            return {
              key: index + 1,
              Stt: item.index,
              "Đơn vị": item.manageUnitName,
              "Mã trạm": item.stationCode,
              "Tên gợi nhớ": item.aliasName,
              "Using Channel": item?.usingChannel?.usingChannel,
              "Battery Status Interval": item.intervals?.batteryStatusInterval,
              "Device Status Interval": item.intervals?.deviceStatusInterval,
              Action: (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsModalOpen(true)
                      setModalType("update")
                      setChoseItem(item)
                    }}
                  >
                    Setting
                  </Button>
                  <Button
                    color="danger"
                    className="!border !border-red-500 !text-red-500"
                    onClick={() => {
                      setIsModalOpen(true)
                      setModalType("delete")
                      setChoseItem(item)
                    }}
                  >
                    Delete
                  </Button>
                </div>
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
        title={choseItem === null ? "Tạo mới" : modalType === "delete" ? "Xóa" : "Cài đặt"}
        open={isModalOpen}
        footer={null}
        closable
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        {choseItem === null ? (
          <ModalSetting
            refetch={() => {
              refetch()
              setIsModalOpen(false)
            }}
            choseItem={choseItem}
          />
        ) : modalType === "delete" ? (
          <ModalDelete
            refetch={() => {
              refetch()
              setIsModalOpen(false)
            }}
            choseItem={choseItem}
          />
        ) : (
          <ModalCreate
            refetch={() => {
              refetch()
              setIsModalOpen(false)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default Settings

type Inputs1 = {
  BatteryStatusInterval: string | number
  DeviceStatusInterval: string | number
}
type Inputs2 = {
  usingChannel: string | number
}
type Inputs3 = {
  manageUnitName: string | number
  stationCode: string | number
  aliasName: string | number
  manageUnitId: string
  simNumber: string
}

const ModalSetting = ({ choseItem, refetch }: any) => {
  const { data: manageUnits } = useGetManageUnits()
  const { isPending: isPending1, mutateAsync: mutateAsync1 } = usePostDevices(DeviceType.UPDATE_DEVICE)
  const { isPending, mutateAsync } = usePostRequest()

  const [typeSubmit, setTypeSubmit] = useState<string | null>()
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    formState: { errors: errors1 },
  } = useForm<Inputs1>()
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
    formState: { errors: errors2 },
  } = useForm<Inputs2>()
  const {
    control: control3,
    handleSubmit: handleSubmit3,
    setValue: setValue3,
    formState: { errors: errors3 },
  } = useForm<Inputs3>()

  useEffect(() => {
    if (!!choseItem) {
      setValue1("BatteryStatusInterval", choseItem?.intervals?.batteryStatusInterval)
      setValue1("DeviceStatusInterval", choseItem?.intervals?.deviceStatusInterval)
      setValue2("usingChannel", choseItem.usingChannel?.usingChannel)
      setValue3("manageUnitName", choseItem.manageUnitName)
      setValue3("stationCode", choseItem.stationCode)
      setValue3("aliasName", choseItem.aliasName)
      setValue3("manageUnitId", choseItem.manageUnitId)
      setValue3("simNumber", choseItem.simNumber)
    }
  }, [choseItem])

  const onSubmitInterval: SubmitHandler<Inputs1> = async (data) => {
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

  const onSubmitChannel: SubmitHandler<Inputs2> = async (data) => {
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
  const onSubmitInfo: SubmitHandler<Inputs3> = async (data) => {
    setTypeSubmit("channel")
    const { aliasName, manageUnitName, stationCode, simNumber, manageUnitId } = data
    const bodyData = {
      imei: choseItem.imei,
      aliasName,
      manageUnitName,
      stationCode,
      simNumber,
      manageUnitId,
      time: Date.now(),
    }
    try {
      await mutateAsync1(bodyData)
      refetch()
      toast.success("Cập nhật thông tin thành công!")
    } catch (error: any) {
      console.log("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 py-3 my-3 border-y border-gray-200">
        <div>
          <label className="font-bold">Đơn vị</label>
          <Controller
            name="manageUnitName"
            control={control3}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Đơn vị" />}
          />
          {errors3.manageUnitName && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Mã trạm</label>
          <Controller
            name="stationCode"
            control={control3}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Mã trạm" />}
          />

          {errors3.stationCode && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Tên gợi nhớ</label>
          <Controller
            name="aliasName"
            control={control3}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Tên gợi nhớ" />}
          />

          {errors3.aliasName && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Đơn vị</label>
          <Controller
            name="manageUnitId"
            control={control3}
            rules={{
              required: true,
            }}
            render={({ field }) => <Select className="w-full" {...field} options={manageUnits} placeholder="Đơn vị" />}
          />
          {errors3.manageUnitId && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Số sim</label>
          <Controller
            name="simNumber"
            control={control3}
            render={({ field }) => <Input {...field} placeholder="Số sim" />}
          />
        </div>
        <div className="mt-5">
          <Button
            disabled={isPending && typeSubmit === "info"}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit3(onSubmitInfo)}
          >
            {isPending && typeSubmit === "info" ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 py-3 my-3 border-y border-gray-200">
        <div>
          <label className="font-bold">Battery Status Interval</label>
          <Controller
            name="BatteryStatusInterval"
            control={control1}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Device Status Interval" />}
          />
          {errors1.BatteryStatusInterval && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Device Status Interval</label>
          <Controller
            name="DeviceStatusInterval"
            control={control1}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Device Status Interval" />}
          />

          {errors1.DeviceStatusInterval && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div className="mt-5">
          <Button
            disabled={isPending1}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit1(onSubmitInterval)}
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
            control={control2}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Device Status Interval" />}
          />
          {errors2.usingChannel && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div className="mt-5">
          <Button
            disabled={isPending && typeSubmit === "channel"}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit2(onSubmitChannel)}
          >
            {isPending && typeSubmit === "channel" ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  )
}

type InputsCrete = {
  imei: string
  manageUnitId: string
  aliasName: string
  stationCode: string
  simNumber: string
  batteryStatusInterval: number
  deviceStatusInterval: number
  usingChannel: string
}

const ModalCreate = ({ refetch }: any) => {
  const { data: manageUnits } = useGetManageUnits()
  const { isPending, mutateAsync } = usePostDevices(DeviceType.CREATE_DEVICE)
  const {
    control: control,
    handleSubmit: handleSubmit,
    formState: { errors: errors },
  } = useForm<InputsCrete>()

  const onSubmit: SubmitHandler<InputsCrete> = async (data) => {
    const {
      imei,
      manageUnitId,
      aliasName,
      stationCode,
      simNumber,
      batteryStatusInterval,
      deviceStatusInterval,
      usingChannel,
    } = data
    const bodyData = {
      imei,
      manageUnitId,
      aliasName,
      stationCode,
      simNumber,
      batteryStatusInterval: +batteryStatusInterval,
      deviceStatusInterval: +deviceStatusInterval,
      usingChannel,
      time: Date.now(),
    }
    try {
      await mutateAsync(bodyData)
      refetch()

      toast.success("Tạo device thành công!")
    } catch (error: any) {
      console.log("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  ;``

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 py-3 my-3 border-y border-gray-200">
        <div>
          <label className="font-bold">Imei</label>
          <Controller
            name="imei"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Đơn vị" />}
          />
          {errors.imei && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Đơn vị</label>
          <Controller
            name="manageUnitId"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Select className="w-full" {...field} options={manageUnits} placeholder="Đơn vị" />}
          />
          {errors.manageUnitId && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Tên gợi nhớ</label>
          <Controller
            name="aliasName"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Tên gợi nhớ" />}
          />
        </div>
        <div>
          <label className="font-bold">Mã trạm</label>
          <Controller
            name="stationCode"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Mã trạm" />}
          />
        </div>
        <div>
          <label className="font-bold">Số sim</label>
          <Controller
            name="simNumber"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Số sim" />}
          />
        </div>
        <div>
          <label className="font-bold">Bat_interval</label>
          <Controller
            name="batteryStatusInterval"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input type="number" {...field} placeholder="Bat_interval" />}
          />

          {errors.batteryStatusInterval && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Devices_interval</label>
          <Controller
            name="deviceStatusInterval"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input type="number" {...field} placeholder="Devices_interval" />}
          />

          {errors.deviceStatusInterval && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Using Channel</label>
          <Controller
            name="usingChannel"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Using Channel" />}
          />

          {errors.usingChannel && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>

        <div className="mt-5 w-full col-span-2">
          <Button
            disabled={isPending}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit(onSubmit)}
          >
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  )
}

const ModalDelete = ({ choseItem, refetch }: any) => {
  const { isPending, mutateAsync } = usePostDevices(DeviceType.DELETE_DEVICE)
  console.log("choseDevice", choseItem)
  const onSubmit = async () => {
    try {
      await mutateAsync({ imei: choseItem?.imei })
      refetch()
      toast.success("Xóa device thành công!")
    } catch (error: any) {
      console.log("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  ;``

  return (
    <div>
      <div className="py-3 my-3 border-y border-gray-200">
        <p className="text-center text-lg mb-2">Bạn chắc chắn xoá device: {choseItem?.aliasName}</p>

        <div className=" w-full col-span-2">
          <Button
            disabled={isPending}
            size="large"
            className="w-full !font-bold !border-red-500 !text-red-500"
            onClick={onSubmit}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
