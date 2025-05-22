import React, { useState } from "react"
import {
  AccountBookFilled,
  AccountBookOutlined,
  AppstoreOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Button, Dropdown, Layout, Menu, Modal, theme } from "antd"
import { Toaster } from "react-hot-toast"
import { Navigate, Route, Routes, useNavigate } from "react-router"
import HomePage from "./pages/HomePage"
import Details from "./pages/Details"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Accounts from "./pages/Accounts"
import useGetAuth from "./hooks/auth/useGetAuth"
import useLogout from "@/hooks/auth/useLogout"
import { Permissions } from "@/types/serverTypes"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import ModalChangePassword from "@/components/modals/ChangePassword.modal"
import Employee from "./pages/Employee"

const { Header, Content, Footer, Sider } = Layout
const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  paddingBlockStart: 10,
  paddingInline: 10,
  top: 0,
  bottom: 0,
}

const App = () => {
  const accountPermission = useCheckPermissions([Permissions.ACCOUNT_VIEW])

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

        {accountPermission && (
          <Route
            path="accounts"
            element={
              <LayoutApp>
                <Accounts />
              </LayoutApp>
            }
          />
        )}
        <Route
          path="employees"
          element={
            <LayoutApp>
              <Employee />
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster
        position="bottom-right"
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
  const { mutateAsync: logout } = useLogout()
  const hasAccountPermissions = useCheckPermissions([Permissions.ACCOUNT_MANAGE])
  const hasDevicePermissions = useCheckPermissions([Permissions.DEVICE_MANAGE])
  const hasEmployeePermissions = useCheckPermissions([Permissions.EMPLOYEE_MANAGE])
  const items: MenuProps["items"] = [
    {
      key: 1,
      icon: React.createElement(AppstoreOutlined),
      label: "Thiết bị",
      onClick: () => navigate("/"),
    },
    hasAccountPermissions
      ? {
          key: 2,
          icon: React.createElement(AccountBookOutlined),
          label: "Tài khoản",
          onClick: () => navigate("/accounts"),
        }
      : null,
    hasEmployeePermissions
      ? {
          key: 6,
          icon: React.createElement(AccountBookFilled),
          label: "Nhân viên",
          onClick: () => navigate("/employees"),
        }
      : null,
    hasDevicePermissions
      ? {
          key: 3,
          icon: React.createElement(SettingOutlined),
          label: "Cài đặt",
          onClick: () => navigate("/settings"),
        }
      : null,
  ].filter(Boolean)

  const itemsList: MenuProps["items"] = [
    hasAccountPermissions
      ? {
          label: "Đổi mật khẩu",
          key: "1",
          onClick: () => {
            setIsModalOpen(true)
          },
        }
      : null,
    {
      label: "Đăng xuất",
      key: "2",
      onClick: async () => {
        await logout()
        navigate("/login")
      },
    },
  ].filter(Boolean)

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
