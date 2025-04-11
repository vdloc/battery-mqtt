import React, { useMemo } from "react"
import { AppstoreOutlined, LineChartOutlined, SettingOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Layout, Menu, theme } from "antd"
import { Toaster } from "react-hot-toast"
import { Route, Routes, useNavigate } from "react-router"
import HomePage from "./pages/HomePage"
import Details from "./pages/Details"
import Settings from "./pages/Settings"

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
  const {
    token: { colorBgContainer },
  } = theme.useToken()
  const navigate = useNavigate()
  const items: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: 1,
        icon: React.createElement(AppstoreOutlined),
        label: "Home",
        onClick: () => navigate("/"),
      },
      {
        key: 2,
        icon: React.createElement(SettingOutlined),
        label: "Settings",
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
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="/device/:imei" element={<Details />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: "center" }}> ©{new Date().getFullYear()}</Footer>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
        }}
      />
    </Layout>
  )
}

export default App
