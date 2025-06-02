import useGetNotificationSettings from "@/hooks/notification/useGetNotificationSettings"
import useUpdateNotificationSettings from "@/hooks/notification/useUpdateNotificationSettings"
import useGetManageUnits from "@/hooks/useGetManageUnits"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import { Permissions } from "@/types/serverTypes"
import { Card, Form, InputNumber, Button, Spin, Select } from "antd"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"

const ConfigForm = () => {
  const [unit, setUnit] = useState<any>(null)
  const { data: manageUnits } = useGetManageUnits()
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()
  const { isLoading, data: settings, refetch } = useGetNotificationSettings(unit)
  const { mutateAsync } = useUpdateNotificationSettings()

  useEffect(() => {
    const { t1 = 0, t2 = 0, t3 = 0 } = settings || {}
    const times = [t1, t2, t3].map((millis) => millis / 1000 / 60)
    const [t1Value = 1, t2Value = 1, t3Value = 1] = times
    setValue("t1", t1Value)
    setValue("t2", t2Value)
    setValue("t3", t3Value)
  }, [settings])

  useEffect(() => {
    if (!unit && manageUnits?.length > 0) setUnit(manageUnits?.[0]?.id)
  }, [unit, manageUnits])

  useCheckPermissions([Permissions.SEND_MESSAGE], "/login")

  const onSubmit = (data: any) => {
    const { t1, t2, t3 } = data
    const [t1Value, t2Value, t3Value] = [t1, t2, t3].map((time) => time * 60 * 1000)

    mutateAsync({ t1: t1Value, t2: t2Value, t3: t3Value, manageUnitId: unit })
      .then(() => {
        refetch()
        toast.success("Cập nhật thành công!")
      })
      .catch((error) => {
        toast.error("error", error)
      })
  }

  return (
    <Card title={<p className="text-2xl font-bold">Cấu hình email cảnh báo</p>}>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="w-56 grid grid-cols-1">
        <Form.Item label="Chọn đơn vị">
          <Controller
            name="manageUnitId"
            control={control}
            defaultValue={unit}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Chọn đơn vị"
                className="w-full"
                options={manageUnits?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
                }))}
                value={unit}
                onChange={(value) => {
                  setUnit(value)
                }}
              />
            )}
          />
        </Form.Item>
        <Form.Item label="T1 (Phút)" validateStatus={errors.t1 ? "error" : ""}>
          <Controller
            name="t1"
            control={control}
            defaultValue={1}
            rules={{
              required: "T1 là bắt buộc",
              min: { value: 1, message: "T1 phải ít nhất là 1 phút" },
            }}
            render={({ field }) => <InputNumber {...field} min={1} style={{ width: "100%" }} />}
          />
        </Form.Item>

        <Form.Item label="T2 (Phút)" validateStatus={errors.t2 ? "error" : ""}>
          <Controller
            name="t2"
            control={control}
            defaultValue={1}
            rules={{
              required: "T2 là bắt buộc",
              min: { value: 1, message: "T2 phải ít nhất là 1 phút" },
            }}
            render={({ field }) => <InputNumber {...field} min={1} style={{ width: "100%" }} />}
          />
        </Form.Item>

        <Form.Item label="T3 (Phút)" validateStatus={errors.t3 ? "error" : ""}>
          <Controller
            name="t3"
            control={control}
            defaultValue={1}
            rules={{
              required: "T3 là bắt buộc",
              min: { value: 1, message: "T3 phải ít nhất là 1 phút" },
            }}
            render={({ field }) => <InputNumber {...field} min={1} style={{ width: "100%" }} />}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ConfigForm
