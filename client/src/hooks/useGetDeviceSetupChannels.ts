import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"

const url = API_URL.GET_DEVICES_SETUP_CHANNELS
const useGetDeviceSetupChannels = () => {
  const navigate = useNavigate()
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      try {
        const res = await requestToken({
          method: "GET",
          url,
        })
        const config = res?.data?.result?.data
        if (config) {
          const configObj: any = {}
          config.forEach((element: any) => {
            configObj[element.imei] = element
          })
          return {
            base: config,
            configObj,
          }
        }
        return undefined
      } catch (error: any) {
        if (error.response.status === 401) {
          navigate("/login")
        }
        return undefined
      }
    },
  })
}

export default useGetDeviceSetupChannels
