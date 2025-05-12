import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import Cookies from "js-cookie"

const url = API_URL.GET_AUTH
const useGetAuth = () => {
  const navigate = useNavigate()
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      try {
        const res = await requestToken({
          method: "GET",
          url,
        })
        return res.data?.result?.data
      } catch (error: any) {
        if (error.response.status === 401) {
          Cookies.remove("battery-auth")
          navigate("/login")
        }
        return undefined
      }
    },
  })
}

export default useGetAuth
