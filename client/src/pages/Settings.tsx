import CheckPermisstion from "@/components/CheckPermisstion"
import CreateDeviceModal from "@/components/modals/CreateDevice.modal"
import DeleteDeviceModal from "@/components/modals/DeleteDevice.modal"
import UpdateDeviceModal from "@/components/modals/UpdateDevice.modal"
import { useSocket } from "@/components/SocketProvider"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import { Permissions } from "@/types/serverTypes"
import { Button, Card, Input, Modal, Table } from "antd"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

const columns = [
  "Stt",
  "Đơn vị",
  "Mã trạm",
  "Tên gợi nhớ",
  "Kênh",
  "Battery Status Interval",
  "Device Status Interval",
  "Hành động",
]

const Settings = () => {
  const [modalType, setModalType] = useState<string>("update")
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { messages, sendMessage, connected, setMessages } = useSocket()
  const [choseItem, setChoseItem] = useState<any>(null)
  const { data: deviceSetupChannels, refetch: refetchChannel } = useGetDeviceSetupChannels()
  const { data: devices, refetch } = useGetDevices()
  const { data: intervals, refetch: refetchInterval } = useGetIntervals()

  useEffect(() => {
    if (devices && connected) {
      sendMessage(JSON.stringify({ operator: "SET_LISTEN_DEVICE", device: devices.base.map((item: any) => item.imei) }))
    }
    return () => {
      setMessages(null)
    }
  }, [connected, sendMessage, devices])

  useEffect(() => {
    if (messages && messages?.operator === "SetInterval") {
      toast.success(`Interval của imei ${messages.imei} đã được cập nhật`)
      refetchInterval()
    }
    if (messages && messages?.operator === "SetupChannel") {
      toast.success(`Channel của imei ${messages.imei} đã được cập nhật`)
      refetchChannel()
    }
  }, [messages])

  const dataToShow = useMemo(() => {
    if (deviceSetupChannels && devices && intervals) {
      return devices.base.map((item: any) => ({
        ...item,
        usingChannel: deviceSetupChannels.configObj[item.imei],
        intervals: intervals.configObj[item.imei],
      }))
    }
    return []
  }, [deviceSetupChannels, devices, intervals])

  const dataToFilter = useMemo(() => {
    if (search) {
      return dataToShow.filter(
        (item: any) =>
          item.aliasName.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.imei.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.simNumber.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.stationCode.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.manageUnitName.toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
    }
    return dataToShow
  }, [search, dataToShow])

  useCheckPermissions([Permissions.DEVICE_MANAGE], "/")
  return (
    <div className="flex flex-col gap-5  mx-auto">
      <Card
        title={<p className="text-2xl font-bold">Cài đặt thiết bị</p>}
        extra={
          <Input
            placeholder="Từ khóa..."
            className="!w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      >
        <div className="flex mb-3 justify-end">
          <CheckPermisstion permission={Permissions.DEVICE_CREATE}>
            <Button
              type="primary"
              onClick={() => {
                setIsModalOpen(true)
                setChoseItem(null)
              }}
            >
              Tạo mới
            </Button>
          </CheckPermisstion>
        </div>
        <Table
          dataSource={dataToFilter?.map((item: any, index: number) => {
            return {
              key: index + 1,
              Stt: item.index,
              "Đơn vị": item.manageUnitName,
              "Mã trạm": item.stationCode,
              "Tên gợi nhớ": item.aliasName,
              Kênh: item?.usingChannel?.usingChannel,
              "Battery Status Interval": item.intervals?.batteryStatusInterval,
              "Device Status Interval": item.intervals?.deviceStatusInterval,
              "Hành động": (
                <div className="flex gap-2">
                  <CheckPermisstion permission={Permissions.DEVICE_UPDATE}>
                    <Button
                      onClick={() => {
                        setIsModalOpen(true)
                        setModalType("update")
                        setChoseItem(item)
                      }}
                    >
                      Cài đặt
                    </Button>
                  </CheckPermisstion>
                  <CheckPermisstion permission={Permissions.DEVICE_DELETE}>
                    <Button
                      color="danger"
                      className="!border !border-red-500 !text-red-500"
                      onClick={() => {
                        setIsModalOpen(true)
                        setModalType("delete")
                        setChoseItem(item)
                      }}
                    >
                      Xóa
                    </Button>
                  </CheckPermisstion>
                </div>
              ),
            }
          })}
          columns={columns.map((item) => ({
            title: item,
            dataIndex: item,
            key: item,
          }))}
        />
      </Card>

      <Modal
        title={choseItem === null ? "Tạo mới" : modalType === "delete" ? "Xóa" : "Cài đặt"}
        open={isModalOpen}
        footer={null}
        closable
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        {!choseItem ? (
          <CreateDeviceModal
            refetch={() => {
              refetch()
              setIsModalOpen(false)
            }}
          />
        ) : modalType === "delete" ? (
          <DeleteDeviceModal
            refetch={() => {
              refetch()
              setIsModalOpen(false)
            }}
            choseItem={choseItem}
          />
        ) : (
          <UpdateDeviceModal
            refetch={() => {
              refetch()
              setIsModalOpen(false)
            }}
            choseItem={choseItem}
          />
        )}
      </Modal>
    </div>
  )
}

export default Settings
