import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"

const url = API_URL.GET_DEVICES
const useGetDevices = () => {
  const navigate = useNavigate()
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      try {
        const res = await requestToken({
          method: "GET",
          url,
        })
        let config = res?.data?.result?.data
        if (config) {
          const configObj: any = {}
          const lastGatewayStatus: any = {}
          const lastBatteryStatus: any = {}
          config = config.map((element: any, index: number) => {
            configObj[element.imei] = element
            lastGatewayStatus[element.imei] = {
              ...element.lastGatewayStatus,
              time: element.time,
            }
            lastBatteryStatus[element.imei] = {
              ...element.lastBatteryStatus,
              time: element.time,
            }
            return {
              ...element,
              index,
              time: element.time,
            }
          })
          return {
            base: config,
            configObj,
            lastGatewayStatus,
            lastBatteryStatus,
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

export default useGetDevices
