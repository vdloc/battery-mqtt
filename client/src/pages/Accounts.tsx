import { useSocket } from "@/components/SocketProvider"
import { TEXT_REQUIRED } from "@/constants"
import useSignup from "@/hooks/auth/useSignup"
import useGetDevices from "@/hooks/useGetDevices"
import useGetDeviceSetupChannels from "@/hooks/useGetDeviceSetupChannels"
import useGetIntervals from "@/hooks/useGetIntervals"
import useGetUser from "@/hooks/user/useGetUser"
import { Button, Card, Input, Modal, Table } from "antd"
import { useEffect, useMemo, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router"
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

const columns = [
  "Stt",
  "Đơn vị",
  "Mã trạm",
  "Tên gợi nhớ",
  "Trạng thái gateway",
  "Volt",
  "Ampe",
  "Battery Interval",
  "Device Interval",
  "Imei",
  "Operator",
  "Số sim",
  "RSSI",
  "Action",
]
const Accounts = () => {
  const [search, setSearch] = useState("")
  const { data: user, refetch } = useGetUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [choseItem, setChoseItem] = useState<any>(null)

  console.log("user", user)
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
          dataSource={user?.map((item: any, index: number) => {
            return {
              key: index + 1,
              Stt: item.index,
              "Đơn vị": item.manageUnitName,
              "Mã trạm": item.stationCode,
              "Tên gợi nhớ": item.aliasName,
              Imei: item.imei,
              Operator: item.lastGatewayStatus?.operator,
              "Số sim": item.simNumber,
              RSSI: item.lastGatewayStatus?.RSSI,
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

type InputsCrete = {
  name: string
  email: string
  password: string
}

const ModalCreate = ({ refetch }: any) => {
  const {
    control: control,
    handleSubmit: handleSubmit,
    formState: { errors: errors },
  } = useForm<InputsCrete>()

  const { isPending, mutateAsync } = useSignup()

  const onSubmit: SubmitHandler<InputsCrete> = async (data) => {
    try {
      await mutateAsync(data)
      refetch()
      toast.success("Tạo tài khoản thành công!")
    } catch (error: any) {
      console.error("error", error?.response)
      toast.error(error?.response?.data?.error?.message)
    }
  }
  ;``

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 py-3 my-3 border-y border-gray-200">
        <div>
          <label className="font-bold">name</label>
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
            render={({ field }) => <Input {...field} placeholder="Đơn vị" />}
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
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  )
}
