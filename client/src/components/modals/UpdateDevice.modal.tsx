import { TEXT_REQUIRED } from "@/constants"
import usePostDevices, { DeviceType } from "@/hooks/devices/usePostDevices"
import useGetManageUnits from "@/hooks/manageUnit/useGetManageUnits"
import usePostRequest from "@/hooks/usePostRequest"
import { Button, Checkbox, Input, Select } from "antd"
import { useEffect, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

type Inputs = {
  manageUnitName: string | number
  stationCode: string | number
  aliasName: string | number
  manageUnitId: string
  simNumber: string
  enableNotification: boolean
  BatteryStatusInterval: string | number
  DeviceStatusInterval: string | number
  usingChannel: string | number
}

const UpdateDeviceModal = ({ choseItem, refetch }: any) => {
  const { data: manageUnits } = useGetManageUnits()
  const { isPending: isPostDevicePending, mutateAsync: mutateAsyncPostDevice } = usePostDevices(
    DeviceType.UPDATE_DEVICE
  )
  const { isPending, mutateAsync } = usePostRequest()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>()

  useEffect(() => {
    if (!!choseItem) {
      console.log(" choseItem:", choseItem)
      setValue("BatteryStatusInterval", choseItem?.intervals?.batteryStatusInterval)
      setValue("DeviceStatusInterval", choseItem?.intervals?.deviceStatusInterval)
      setValue("usingChannel", choseItem.usingChannel?.usingChannel)
      setValue("manageUnitName", choseItem.manageUnitName)
      setValue("stationCode", choseItem.stationCode)
      setValue("aliasName", choseItem.aliasName)
      setValue("manageUnitId", choseItem.manageUnitId)
      setValue("simNumber", choseItem.simNumber)
      setValue("enableNotification", choseItem.enableNotification)
    }
  }, [choseItem])

  const onSubmitInfo: SubmitHandler<Inputs> = async (data) => {
    const {
      aliasName,
      manageUnitName,
      stationCode,
      simNumber,
      manageUnitId,
      enableNotification,
      usingChannel,
      BatteryStatusInterval,
      DeviceStatusInterval,
    } = data
    const infoData = {
      imei: choseItem.imei,
      aliasName,
      manageUnitName,
      stationCode,
      simNumber,
      manageUnitId,
      enableNotification,
      time: Date.now(),
    }
    const channelData = {
      imei: choseItem.imei,
      operator: "SetupChannel",
      infor: {
        usingChannel,
      },
      time: Date.now(),
    }
    const intervalData = {
      imei: choseItem.imei,
      operator: "SetInterval",
      infor: {
        BatteryStatusInterval: +BatteryStatusInterval,
        DeviceStatusInterval: +DeviceStatusInterval,
      },
      time: Date.now(),
    }
    try {
      await Promise.all([mutateAsyncPostDevice(infoData), mutateAsync(channelData), mutateAsync(intervalData)])
      refetch()
      toast.success("Cập nhật thông tin thành công!")
    } catch (error: any) {
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 py-3 my-3 border-t border-gray-200">
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
          <label className="font-bold">Mã trạm</label>
          <Controller
            name="stationCode"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Mã trạm" />}
          />

          {errors.stationCode && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Tên gợi nhớ</label>
          <Controller
            name="aliasName"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Tên gợi nhớ" />}
          />

          {errors.aliasName && <span className="text-red-500">{TEXT_REQUIRED}</span>}
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
          <label className="font-bold">Chu kỳ trạng thái pin</label>
          <Controller
            name="BatteryStatusInterval"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Chu kỳ trạng thái pin" />}
          />
          {errors.BatteryStatusInterval && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Chu kỳ trạng thái thiết bị</label>
          <Controller
            name="DeviceStatusInterval"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Chu kỳ trạng thái thiết bị" />}
          />

          {errors.DeviceStatusInterval && <span className="text-red-500">{TEXT_REQUIRED}</span>}
        </div>
        <div>
          <label className="font-bold">Kênh</label>
          <Controller
            name="usingChannel"
            control={control}
            rules={{
              required: { value: true, message: TEXT_REQUIRED },
              maxLength: { value: 4, message: "Độ dài tối đa 4 ký tự" },
              minLength: { value: 4, message: "Độ dài tối thiểu 4 ký tự" },
            }}
            render={({ field }) => <Input {...field} placeholder="Kênh" />}
          />
          {errors.usingChannel && <span className="text-red-500">{errors.usingChannel.message}</span>}
        </div>
        <div className="grid">
          <label className="font-bold">Nhận cảnh báo qua email</label>
          <div>
            <Controller
              name="enableNotification"
              control={control}
              render={({ field }) => <Checkbox {...field} checked={field.value} />}
            />
          </div>
        </div>
        <div className="mt-5 col-span-2">
          <Button size="large" className="w-full !font-bold" type="primary" onClick={handleSubmit(onSubmitInfo)}>
            Cập nhật
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UpdateDeviceModal
