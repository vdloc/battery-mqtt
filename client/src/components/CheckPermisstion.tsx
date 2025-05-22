import useGetAuth from "@/hooks/auth/useGetAuth"

const CheckPermisstion = ({ children, permission }: { children: React.ReactNode; permission: string }) => {
  const { data: me } = useGetAuth()
  if (me?.permissions.includes(permission)) {
    return <>{children}</>
  }
  return <></>
}

export default CheckPermisstion
