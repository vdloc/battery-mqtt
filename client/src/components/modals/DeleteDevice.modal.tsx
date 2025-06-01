import usePostDevices, { DeviceType } from "@/hooks/devices/usePostDevices"
import { Button } from "antd"
import toast from "react-hot-toast"

const DeleteDeviceModal = ({ choseItem, refetch }: any) => {
  const { isPending, mutateAsync } = usePostDevices(DeviceType.DELETE_DEVICE)
  console.error("choseDevice", choseItem)
  const onSubmit = async () => {
    try {
      await mutateAsync({ imei: choseItem?.imei })
      refetch()
      toast.success("Xóa device thành công!")
    } catch (error: any) {
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  ;``

  return (
    <div>
      <div className="py-3 my-3 border-y border-gray-200">
        <p className="text-center text-lg mb-2">Bạn chắc chắn xoá device: {choseItem?.aliasName}</p>

        <div className=" w-full col-span-2">
          <Button
            disabled={isPending}
            size="large"
            className="w-full !font-bold !border-red-500 !text-red-500"
            onClick={onSubmit}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteDeviceModal
