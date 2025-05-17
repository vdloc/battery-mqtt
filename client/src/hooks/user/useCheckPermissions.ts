import useGetAuth from "@/hooks/auth/useGetAuth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

const useCheckPermissions = (permissions: string[], redirectRoute: string | null = null) => {
  const { data: me } = useGetAuth()
  const navigate = useNavigate()
  const [hasPermissions, setHasPermissions] = useState(
    permissions.length === 0 || permissions.every((permission) => me?.permissions.includes(permission))
  )

  useEffect(() => {
    if (!hasPermissions && redirectRoute) {
      navigate(redirectRoute)
    }
  }, [hasPermissions, redirectRoute])

  useEffect(() => {
    setHasPermissions(
      permissions.length === 0 || permissions.every((permission) => me?.permissions.includes(permission))
    )
  }, [permissions])

  return hasPermissions
}

export default useCheckPermissions
