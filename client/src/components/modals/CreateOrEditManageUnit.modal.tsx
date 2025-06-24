import { TEXT_REQUIRED } from "@/constants"
import useCreateManageUnit from "@/hooks/manageUnit/useCreateManageUnit"
import useUpdateManageUnit from "@/hooks/manageUnit/useUpdateManageUnit"
import { Button, Input } from "antd"
import { useEffect } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

type FormState = {
  name?: string
}

const ModalCreateOrEditManageUnit = ({ refetch, choseItem, unit }: any) => {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors: errors },
  } = useForm<FormState>()

  const { isPending, mutateAsync } = useCreateManageUnit()
  const { isPending: isPendingUpdate, mutateAsync: mutateAsyncUpdate } = useUpdateManageUnit()

  useEffect(() => {
    if (choseItem) {
      setValue("name", choseItem.name)
    }
  }, [choseItem])

  const onSubmit: SubmitHandler<FormState> = async (data) => {
    const { name } = data
    try {
      if (!choseItem) {
        await mutateAsync({ name, manageUnitId: unit })
        toast.success("Tạo đơn vị thành công!")
      } else {
        await mutateAsyncUpdate({ id: choseItem.id, name })
        toast.success("Cập nhật đơn vị thành công!")
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
          <label className="font-bold">Tên đơn vị</label>
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
            render={({ field }) => <Input {...field} placeholder="Tên đơn vị" />}
          />
          {errors.name && <span className="text-red-500">{errors.name.message}</span>}
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
                ? "Đang tạo đơn vị..."
                : "Tạo mới đơn vị"
              : isPendingUpdate
              ? "Đang cập nhật đơn vị..."
              : "Cập nhật đơn vị"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModalCreateOrEditManageUnit
