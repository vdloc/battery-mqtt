import useDeleteEmployee from "@/hooks/employee/useDeleteEmployee"
import { Button } from "antd"
import toast from "react-hot-toast"

const ModalDeleteEmployee = ({ refetch, choseItem }: any) => {
  const { mutateAsync } = useDeleteEmployee()

  const handleSubmit = async () => {
    try {
      if (!choseItem) {
        return refetch()
      }

      const { id, name } = choseItem
      await mutateAsync({ id })
      toast.success(`Đã xóa nhân viên ${name} thành công!`)

      refetch()
    } catch (error: any) {
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }

  return (
    <div className=" border-t border-gray-200 pt-4">
      <p className="text-center pb-4">
        Bạn chắc chắn muốn xóa nhân viên <b>{choseItem?.name}</b>
      </p>
      <div className="grid grid-cols-2 gap-3 ">
        <Button size="large" type="default" onClick={refetch}>
          Hủy
        </Button>
        <Button size="large" color="danger" variant="solid" onClick={handleSubmit}>
          Xác nhận
        </Button>
      </div>
    </div>
  )
}
export default ModalDeleteEmployee
