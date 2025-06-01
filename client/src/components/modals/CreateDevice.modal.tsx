import { TEXT_REQUIRED } from "@/constants"
import usePostDevices, { DeviceType } from "@/hooks/devices/usePostDevices"
import useGetManageUnits from "@/hooks/useGetManageUnits"
import { Input, Select, Button } from "antd"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import toast from "react-hot-toast"

type InputsCreate = {
  imei: string
  manageUnitId: string
  aliasName: string
  stationCode: string
  simNumber: string
  batteryStatusInterval: number
  deviceStatusInterval: number
  usingChannel: string
}

const CreateDeviceModal = ({ refetch }: any) => {
  const { data: manageUnits } = useGetManageUnits()
  const { isPending, mutateAsync } = usePostDevices(DeviceType.CREATE_DEVICE)
  const {
    control: control,
    handleSubmit: handleSubmit,
    formState: { errors: errors },
  } = useForm<InputsCreate>()

  const onSubmit: SubmitHandler<InputsCreate> = async (data) => {
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
      console.error("error", error?.response)
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
          <label className="font-bold">Kênh</label>
          <Controller
            name="usingChannel"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => <Input {...field} placeholder="Kênh" />}
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

export default CreateDeviceModal
