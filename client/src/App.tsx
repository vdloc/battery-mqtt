import React, { useMemo } from "react"
import { AccountBookOutlined, AppstoreOutlined, SettingOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Layout, Menu, theme } from "antd"
import { Toaster } from "react-hot-toast"
import { Route, Routes, useNavigate } from "react-router"
import HomePage from "./pages/HomePage"
import Details from "./pages/Details"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Accounts from "./pages/Accounts"

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
  const navigate = useNavigate()
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
  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["4"]} items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>{children}</Content>
        <Footer style={{ textAlign: "center" }}> ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  )
}
