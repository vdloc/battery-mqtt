import useDeleteUser from "@/hooks/user/useDeleteUser"
import { Button } from "antd"
import toast from "react-hot-toast"

const ModalDeleteAccount = ({ refetch, choseItem }: any) => {
  const { mutateAsync } = useDeleteUser()

  const handleSubmit = async () => {
    try {
      if (!choseItem) {
        return refetch()
      }

      const { id, name } = choseItem
      await mutateAsync({ id })
      toast.success(`Đã xóa tài khoản ${name} thành công!`)

      refetch()
    } catch (error: any) {
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 py-3 my-3 border-y border-gray-200">
        <Button size="large" color="danger" variant="solid" onClick={handleSubmit}>
          Xác nhận
        </Button>
        <Button size="large" type="default" onClick={refetch}>
          Hủy
        </Button>
      </div>
    </div>
  )
}
export default ModalDeleteAccount
