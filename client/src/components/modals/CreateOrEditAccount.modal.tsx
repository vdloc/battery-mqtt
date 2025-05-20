import { TEXT_REQUIRED } from "@/constants"
import useSignup from "@/hooks/auth/useSignup"
import useGetManageUnits from "@/hooks/useGetManageUnits"
import useUpdateUser from "@/hooks/user/useUpdateUser"
import { Button, Input, Select } from "antd"
import { useEffect } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

type FormState = {
  name?: string
  email?: string
  password?: string
  manageUnitId?: string
}

const ModalCreateOrEditAccount = ({ refetch, choseItem }: any) => {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors: errors },
  } = useForm<FormState>()

  const { isPending, mutateAsync } = useSignup()
  const { isPending: isPendingUpdate, mutateAsync: mutateAsyncUpdate } = useUpdateUser()
  const { data: manageUnits } = useGetManageUnits()

  useEffect(() => {
    if (choseItem) {
      setValue("name", choseItem.name)
      setValue("email", choseItem.email)
      setValue("manageUnitId", choseItem.manageUnit?.manageUnitId)
    }
  }, [choseItem])

  const onSubmit: SubmitHandler<FormState> = async (data) => {
    try {
      if (!choseItem) {
        await mutateAsync(data)
        toast.success("Tạo tài khoản thành công!")
      } else {
        const { name, email, manageUnitId } = data
        await mutateAsyncUpdate({ id: choseItem.id, name, email, manageUnitId })
        toast.success("Cập nhật tài khoản thành công!")
      }

      refetch()
    } catch (error: any) {
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 py-3 my-3 border-y border-gray-200">
        <div>
          <label className="font-bold">Đơn vị</label>
          <Controller
            name="manageUnitId"
            control={control}
            rules={{
              required: {
                value: true,
                message: TEXT_REQUIRED,
              },
            }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Chọn đơn vị"
                className="w-full"
                options={manageUnits?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
                }))}
                onChange={(value) => {
                  setValue("manageUnitId", value)
                }}
              />
            )}
          />
          {errors.manageUnitId && <span className="text-red-500">{errors.manageUnitId.message}</span>}
        </div>
        <div>
          <label className="font-bold">Tên tài khoản</label>
          <Controller
            name="name"
            control={control}
            rules={{
              required: {
                value: true,
                message: TEXT_REQUIRED,
              },
              minLength: {
                value: 2,
                message: "name must be at least 2 characters",
              },
              maxLength: {
                value: 50,
                message: "name must be less than 50 characters",
              },
            }}
            render={({ field }) => <Input {...field} placeholder="Tên tài khoản" />}
          />
          {errors.name && <span className="text-red-500">{errors.name.message}</span>}
        </div>

        <div>
          <label className="font-bold">Email</label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: {
                value: true,
                message: TEXT_REQUIRED,
              },
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "invalid email address",
              },
            }}
            render={({ field }) => <Input {...field} placeholder="Email" />}
          />
          {errors.email && <span className="text-red-500">{errors.email.message}</span>}
        </div>
        <div>
          <label className="font-bold">Mật khẩu</label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: {
                value: true,
                message: TEXT_REQUIRED,
              },
            }}
            render={({ field }) => (
              <Input.Password {...field} placeholder="Mật khẩu" className="[&>input]:!shadow-[unset]" type="password" />
            )}
          />
          {errors.password && <span className="text-red-500">{errors.password.message}</span>}
        </div>
        <div className="mt-5 w-full ">
          <Button
            disabled={isPending || isPendingUpdate}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit(onSubmit)}
          >
            {!choseItem ? (isPending ? "Đang tạo..." : "Tạo") : isPendingUpdate ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModalCreateOrEditAccount
