import CheckPermisstion from "@/components/CheckPermisstion"
import ModalCreateOrEditEmployee from "@/components/modals/CreateOrEditEmployee.modal"
import ModalCreateOrEditManageUnit from "@/components/modals/CreateOrEditManageUnit.modal"

import ModalDeleteEmployee from "@/components/modals/DeleteEmployee.modal"
import useGetEmployee from "@/hooks/employee/useGetEmployee"
import useGetManageUnits from "@/hooks/manageUnit/useGetManageUnits"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import { Permissions } from "@/types/serverTypes"
import { formatDate } from "@/utils/formatDate"
import { Button, Card, Input, Modal, Select, Table } from "antd"
import { useEffect, useState } from "react"

const columns = ["Stt", "Tên đơn vị", "Hành động"]
const ManageUnits = () => {
  const [unit, setUnit] = useState<any>(null)
  const [search, setSearch] = useState("")
  const { isLoading, data: manageUnits, refetch } = useGetManageUnits()
  const [isModalCreateOrUpdateOpen, setModalCreateOrUpdateOpen] = useState(false)
  const [isModalDeleteOpen, setModalDeleteOpen] = useState(false)
  const [choseItem, setChoseItem] = useState<any>(null)

  useEffect(() => {
    if (!unit && manageUnits?.length > 0) setUnit(manageUnits?.[0]?.id)
  }, [unit, manageUnits])

  useCheckPermissions([Permissions.EMPLOYEE_VIEW], "/login")
  return (
    <>
      <Card title={<p className="text-2xl font-bold">Danh sách đơn vị</p>}>
        <div className="flex mb-3 justify-end">
          <CheckPermisstion permission={Permissions.EMPLOYEE_CREATE}>
            <Button
              type="primary"
              onClick={() => {
                setModalCreateOrUpdateOpen(true)
                setChoseItem(null)
              }}
            >
              Tạo mới
            </Button>
          </CheckPermisstion>
        </div>
        <Table
          loading={isLoading}
          dataSource={manageUnits
            ?.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase()))
            .map((item: any, index: number) => {
              return {
                key: index + 1,
                Stt: index + 1,
                "Tên đơn vị": (
                  <div className="flex items-center gap-2">
                    <img className="max-h-10 max-w-10" src={item.image} alt="" /> {item.name}
                  </div>
                ),
                "Hành động": (
                  <div className="flex gap-4">
                    <CheckPermisstion permission={Permissions.EMPLOYEE_UPDATE}>
                      <Button
                        onClick={() => {
                          setChoseItem(item)
                          setModalCreateOrUpdateOpen(true)
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    </CheckPermisstion>
                    <CheckPermisstion permission={Permissions.EMPLOYEE_DELETE}>
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
                    </CheckPermisstion>
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
        <ModalCreateOrEditManageUnit
          refetch={() => {
            refetch()
            setModalCreateOrUpdateOpen(false)
          }}
          choseItem={choseItem}
          unit={unit}
        />
      </Modal>
      <Modal
        title={`Xóa nhân viên`}
        open={isModalDeleteOpen}
        footer={null}
        closable
        onCancel={() => setModalDeleteOpen(false)}
        destroyOnClose
      >
        <ModalDeleteEmployee
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

export default ManageUnits
