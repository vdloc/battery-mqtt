import { TEXT_REQUIRED } from "@/constants"
import usePostDevices, { DeviceType } from "@/hooks/devices/usePostDevices"
import useGetManageUnits from "@/hooks/useGetManageUnits"
import usePostRequest from "@/hooks/usePostRequest"
import { Button, Checkbox, Input, Select } from "antd"
import { useEffect, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

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
  enableNotification: boolean
}

const UpdateDeviceModal = ({ choseItem, refetch }: any) => {
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
      console.log(" choseItem:", choseItem)
      setValue1("BatteryStatusInterval", choseItem?.intervals?.batteryStatusInterval)
      setValue1("DeviceStatusInterval", choseItem?.intervals?.deviceStatusInterval)
      setValue2("usingChannel", choseItem.usingChannel?.usingChannel)
      setValue3("manageUnitName", choseItem.manageUnitName)
      setValue3("stationCode", choseItem.stationCode)
      setValue3("aliasName", choseItem.aliasName)
      setValue3("manageUnitId", choseItem.manageUnitId)
      setValue3("simNumber", choseItem.simNumber)
      setValue3("enableNotification", choseItem.enableNotification)
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
      console.error("error", error?.response)
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
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  const onSubmitInfo: SubmitHandler<Inputs3> = async (data) => {
    setTypeSubmit("channel")
    const { aliasName, manageUnitName, stationCode, simNumber, manageUnitId, enableNotification } = data
    const bodyData = {
      imei: choseItem.imei,
      aliasName,
      manageUnitName,
      stationCode,
      simNumber,
      manageUnitId,
      enableNotification,
      time: Date.now(),
    }
    try {
      await mutateAsync1(bodyData)
      refetch()
      toast.success("Cập nhật thông tin thành công!")
    } catch (error: any) {
      console.error("error", error?.response)
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
        <div className="grid">
          <label className="font-bold">Nhận cảnh báo qua email</label>
          <div>
            <Controller
              name="enableNotification"
              control={control3}
              render={({ field }) => <Checkbox {...field} checked={field.value} />}
            />
          </div>
        </div>
        <div className="mt-5">
          <Button
            disabled={isPending && typeSubmit === "info"}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit3(onSubmitInfo)}
          >
            {isPending && typeSubmit === "info" ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 py-3 my-3 border-y border-gray-200">
        <div>
          <label className="font-bold">Chu kỳ trạng thái pin</label>
          <Controller
            name="BatteryStatusInterval"
            control={control1}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Chu kỳ trạng thái pin" />}
          />
          {errors1.BatteryStatusInterval && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Chu kỳ trạng thái thiết bị</label>
          <Controller
            name="DeviceStatusInterval"
            control={control1}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Chu kỳ trạng thái thiết bị" />}
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
            {isPending && typeSubmit === "interval" ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="font-bold">Kênh</label>
          <Controller
            name="usingChannel"
            control={control2}
            rules={{
              required: { value: true, message: TEXT_REQUIRED },
              maxLength: { value: 4, message: "Độ dài tối đa 4 ký tự" },
              minLength: { value: 4, message: "Độ dài tối thiểu 4 ký tự" },
            }}
            render={({ field }) => <Input {...field} placeholder="Kênh" />}
          />
          {errors2.usingChannel && <span className="text-red-500">{errors2.usingChannel.message}</span>}
        </div>
        <div className="mt-5">
          <Button
            disabled={isPending && typeSubmit === "channel"}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit2(onSubmitChannel)}
          >
            {isPending && typeSubmit === "channel" ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UpdateDeviceModal
