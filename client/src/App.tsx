import React, { useMemo, useState } from "react"
import { AccountBookOutlined, AppstoreOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Button, Dropdown, Input, Layout, Menu, Modal, Space, theme } from "antd"
import toast, { Toaster } from "react-hot-toast"
import { Route, Routes, useNavigate } from "react-router"
import HomePage from "./pages/HomePage"
import Details from "./pages/Details"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Accounts from "./pages/Accounts"
import useGetAuth from "./hooks/auth/useGetAuth"
import Cookies from "js-cookie"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import useChangePassword from "./hooks/auth/useChangePassword"
import { TEXT_REQUIRED } from "./constants"

const { Header, Content, Footer, Sider } = Layout
const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
}

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          index
          element={
            <LayoutApp>
              <HomePage />
            </LayoutApp>
          }
        />
        <Route
          path="accounts"
          element={
            <LayoutApp>
              <Accounts />
            </LayoutApp>
          }
        />
        <Route
          path="/device/:imei"
          element={
            <LayoutApp>
              <Details />
            </LayoutApp>
          }
        />
        <Route
          path="/settings"
          element={
            <LayoutApp>
              <Settings />
            </LayoutApp>
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
        }}
      />
    </>
  )
}

export default App

const LayoutApp = ({ children }: any) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const { data: me } = useGetAuth()
  const items: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: 1,
        icon: React.createElement(AppstoreOutlined),
        label: "Thiết bị",
        onClick: () => navigate("/"),
      },
      {
        key: 2,
        icon: React.createElement(AccountBookOutlined),
        label: "Tài khoản",
        onClick: () => navigate("/accounts"),
      },
      {
        key: 3,
        icon: React.createElement(SettingOutlined),
        label: "Cài đặt",
        onClick: () => navigate("/settings"),
      },
    ]
  }, [])

  const itemsList: MenuProps["items"] = [
    {
      label: "Đổi mật khẩu",
      key: "1",
      onClick: () => {
        setIsModalOpen(true)
        navigate("/login")
      },
    },
    {
      label: "Đăng xuất",
      key: "2",
      onClick: () => {
        Cookies.remove("battery-auth")
        navigate("/login")
      },
    },
  ]

  const menuProps = {
    items: itemsList,
  }
  return (
    <>
      <Layout hasSider>
        <Sider style={siderStyle}>
          <div className="demo-logo-vertical" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["4"]} items={items} />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <div className="flex justify-end items-center px-6 h-16">
              <Dropdown menu={menuProps}>
                <Button className="!py-2 !h-10 !pl-1 !rounded-3xl">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300">
                    <img className="w-6 h-6" src={me?.user?.image || "/person.svg"} alt="" />
                  </div>

                  {me?.user?.name}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>{children}</Content>
          <Footer style={{ textAlign: "center" }}> ©{new Date().getFullYear()}</Footer>
        </Layout>
      </Layout>
      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        footer={null}
        closable
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <ModalChangePassword
          refetch={() => {
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
type InputsCrete = {
  password?: string
}

const ModalChangePassword = ({ refetch }: any) => {
  const {
    control,
    handleSubmit,
    formState: { errors: errors },
  } = useForm<InputsCrete>()

  const { isPending, mutateAsync } = useChangePassword()

  const onSubmit: SubmitHandler<InputsCrete> = async (data) => {
    try {
      await mutateAsync(data)
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
            {isPending ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </div>
    </div>
  )
}
