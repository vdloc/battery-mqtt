import { TEXT_REQUIRED } from "@/constants"
import useChangePassword from "@/hooks/auth/useChangePassword"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import { Permissions } from "@/types/serverTypes"
import { Button, Input } from "antd"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

type InputsCreate = {
  password?: string
}
const ModalChangePassword = ({ refetch }: any) => {
  const {
    control,
    handleSubmit,
    formState: { errors: errors },
  } = useForm<InputsCreate>()

  const { isPending, mutateAsync } = useChangePassword()
  const onSubmit: SubmitHandler<InputsCreate> = async (data) => {
    try {
      await mutateAsync(data)
      refetch()
    } catch (error: any) {
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }

  useCheckPermissions([Permissions.ACCOUNT_MANAGE], "/login")

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 py-3 my-3 border-y border-gray-200">
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
            render={({ field }) => <Input {...field} placeholder="Mật khẩu" />}
          />
          {errors.password && <span className="text-red-500">{errors.password.message}</span>}
        </div>

        <div className="mt-5 w-full ">
          <Button
            disabled={isPending}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit(onSubmit)}
          >
            {isPending ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModalChangePassword
