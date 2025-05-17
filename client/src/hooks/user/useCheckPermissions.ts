import useGetAuth from "@/hooks/auth/useGetAuth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

const useCheckPermissions = (permissions: string[], redirectRoute: string | null = null) => {
  const { data: me, isSuccess, isLoadingError } = useGetAuth()

  const navigate = useNavigate()
  const [hasPermissions, setHasPermissions] = useState(true)

  useEffect(() => {
    if (((isSuccess && !hasPermissions) || isLoadingError) && redirectRoute) {
      navigate(redirectRoute)
    }
  }, [hasPermissions, redirectRoute])

  useEffect(() => {
    isSuccess &&
      setHasPermissions(
        permissions.length === 0 || permissions.every((permission) => me?.permissions.includes(permission))
      )
  }, [permissions])

  return hasPermissions
}

export default useCheckPermissions
