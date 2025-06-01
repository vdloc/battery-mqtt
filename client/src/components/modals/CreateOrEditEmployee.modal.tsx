import { TEXT_REQUIRED } from "@/constants"
import useCreateEmployee from "@/hooks/employee/useCreateEmployee"
import useUpdateEmployee from "@/hooks/employee/useUpdateEmployee"
import { Button, Input } from "antd"
import { useEffect } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

type FormState = {
  name?: string
  email?: string
}

const ModalCreateOrEditEmployee = ({ refetch, choseItem, unit }: any) => {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors: errors },
  } = useForm<FormState>()

  const { isPending, mutateAsync } = useCreateEmployee()
  const { isPending: isPendingUpdate, mutateAsync: mutateAsyncUpdate } = useUpdateEmployee()

  useEffect(() => {
    if (choseItem) {
      setValue("name", choseItem.name)
      setValue("email", choseItem.email)
    }
  }, [choseItem])

  const onSubmit: SubmitHandler<FormState> = async (data) => {
    const { name, email } = data
    try {
      if (!choseItem) {
        await mutateAsync({ name, email, manageUnitId: unit })
        toast.success("Tạo nhân viên thành công!")
      } else {
        await mutateAsyncUpdate({ id: choseItem.id, name, email })
        toast.success("Cập nhật nhân viên thành công!")
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
          <label className="font-bold">Tên nhân viên</label>
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
            render={({ field }) => <Input {...field} placeholder="Tên nhân viên" />}
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
        <div className="mt-5 w-full ">
          <Button
            disabled={isPending || isPendingUpdate}
            size="large"
            className="w-full !font-bold"
            type="primary"
            onClick={handleSubmit(onSubmit)}
          >
            {!choseItem
              ? isPending
                ? "Đang tạo nhân viên..."
                : "Tạo mới nhân viên"
              : isPendingUpdate
              ? "Đang cập nhật nhân viên..."
              : "Cập nhật nhân viên"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModalCreateOrEditEmployee
