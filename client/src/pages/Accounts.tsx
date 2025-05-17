import { TEXT_REQUIRED } from "@/constants"
import useSignup from "@/hooks/auth/useSignup"
import useGetManageUnits from "@/hooks/useGetManageUnits"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import useGetUser from "@/hooks/user/useGetUser"
import useUpdateUser from "@/hooks/user/useUpdateUser"
import { Permissions } from "@/types/serverTypes"
import { formatDate } from "@/utils/formatDate"
import { Button, Card, Input, Modal, Select, Table } from "antd"
import { useEffect, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"
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

const columns = ["Stt", "Tên tài khoản", "Email", "Ngày tạo", "Hành động"]
const Accounts = () => {
  const [search, setSearch] = useState("")
  const { data: user, refetch } = useGetUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [choseItem, setChoseItem] = useState<any>(null)

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
              setIsModalOpen(true)
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
              "Hành động": (
                <Button
                  onClick={() => {
                    setChoseItem(item)
                    setIsModalOpen(true)
                  }}
                >
                  Chỉnh sửa
                </Button>
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
        open={isModalOpen}
        footer={null}
        closable
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <ModalCreate
          refetch={() => {
            refetch()
            setIsModalOpen(false)
          }}
          choseItem={choseItem}
        />
      </Modal>
    </>
  )
}

export default Accounts

type InputsCreate = {
  name?: string
  email?: string
  password?: string
  manageUnitId?: string
}

const ModalCreate = ({ refetch, choseItem }: any) => {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors: errors },
  } = useForm<InputsCreate>()

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

  const onSubmit: SubmitHandler<InputsCreate> = async (data) => {
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
        {!choseItem && (
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
        )}

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
