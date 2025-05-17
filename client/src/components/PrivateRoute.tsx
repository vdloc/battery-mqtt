import useGetAuth from "@/hooks/auth/useGetAuth"
import useCheckPermissions from "@/hooks/user/useCheckPermissions"
import API_URL from "@/utils/api/url"
import { Navigate, Outlet } from "react-router"

interface PrivateRouteProps {
  requiredPermissions?: string[]
  children?: React.ReactNode
  redirectRoute?: string | null
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredPermissions = [], redirectRoute = null }) => {
  const hasPermissions = useCheckPermissions(requiredPermissions, redirectRoute)
  const { data: me } = useGetAuth()

  if (!me || !hasPermissions) {
    return <Navigate to={redirectRoute || "/login"} replace />
  }

  return <Outlet />
}

export default PrivateRoute
