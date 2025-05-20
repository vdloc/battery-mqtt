import ModalCreateOrEditAccount from "@/components/modals/CreateOrEditAccount.modal"
import ModalDeleteAccount from "@/components/modals/DeleteAccount.modal"
import useGetManageUnits from "@/hooks/useGetManageUnits"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import useGetUser from "@/hooks/user/useGetUser"
import { Permissions } from "@/types/serverTypes"
import { formatDate } from "@/utils/formatDate"
import { Button, Card, Input, Modal, Table } from "antd"
import { useState } from "react"

export type DeviceType = {
  id: string
  imei: string
  lastBatteryStatus: {
    CH1: {
      Voltage: string
      Ampere: string
    }
    CH2: {
      Voltage: string
      Ampere: string
    }
    CH3: {
      Voltage: string
      Ampere: string
    }
    CH4: {
      Voltage: string
      Ampere: string
    }
  }
  lastGatewayStatus: {
    operator: string
    RSSI: string
    IP: string
    usingChannel: string
    fwVersion: string
  }
}

const columns = ["Stt", "Tên tài khoản", "Email", "Đơn vị", "Ngày tạo", "Hành động"]
const Accounts = () => {
  const [search, setSearch] = useState("")
  const { data: user, refetch } = useGetUser()
  const [isModalCreateOrUpdateOpen, setModalCreateOrUpdateOpen] = useState(false)
  const [isModalDeleteOpen, setModalDeleteOpen] = useState(false)
  const [choseItem, setChoseItem] = useState<any>(null)
  const { data: manageUnits } = useGetManageUnits()

  useCheckPermissions([Permissions.ACCOUNT_MANAGE], "/login")

  return (
    <>
      <Card
        title={<p className="text-2xl font-bold">Danh sách tài khoản</p>}
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
          <Button
            type="primary"
            onClick={() => {
              setModalCreateOrUpdateOpen(true)
              setChoseItem(null)
            }}
          >
            Tạo mới
          </Button>
        </div>
        <Table
          // pagination={{
          //   pageSize: 50,
          // }}
          dataSource={user?.users?.map((item: any, index: number) => {
            const manageUnitName = manageUnits?.find(
              (manageUnit: Record<string, any>) => manageUnit.id === item?.manageUnit?.manageUnitId
            )?.name
            return {
              key: index + 1,
              Stt: index + 1,
              "Tên tài khoản": (
                <div className="flex items-center gap-2">
                  <img className="max-h-10 max-w-10" src={item.image} alt="" /> {item.name}
                </div>
              ),
              Email: item.email,
              "Ngày tạo": formatDate(item.createdAt),
              "Đơn vị": manageUnitName,
              "Hành động": (
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setChoseItem(item)
                      setModalCreateOrUpdateOpen(true)
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    color="danger"
                    variant="solid"
                    onClick={() => {
                      setChoseItem(item)
                      setModalDeleteOpen(true)
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              ),
            }
          })}
          columns={columns.map((item, index) => ({
            title: item,
            dataIndex: item,
            key: item,
            fixed: index < 4 ? "left" : undefined,
          }))}
          scroll={{ x: "max-content" }}
        />
      </Card>
      <Modal
        title={choseItem === null ? "Tạo mới" : "Chỉnh sửa"}
        open={isModalCreateOrUpdateOpen}
        footer={null}
        closable
        onCancel={() => setModalCreateOrUpdateOpen(false)}
        destroyOnClose
      >
        <ModalCreateOrEditAccount
          refetch={() => {
            refetch()
            setModalCreateOrUpdateOpen(false)
          }}
          choseItem={choseItem}
        />
      </Modal>
      <Modal
        title={`Xóa tài khoản`}
        open={isModalDeleteOpen}
        footer={null}
        closable
        onCancel={() => setModalDeleteOpen(false)}
        destroyOnClose
      >
        <ModalDeleteAccount
          refetch={() => {
            refetch()
            setModalDeleteOpen(false)
          }}
          choseItem={choseItem}
        />
      </Modal>
    </>
  )
}

export default Accounts
