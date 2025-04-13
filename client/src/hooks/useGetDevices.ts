import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"

const url = API_URL.GET_DEVICES
const useGetDevices = () => {
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await request({
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
          lastGatewayStatus[element.imei] = element.lastGatewayStatus
          lastBatteryStatus[element.imei] = element.lastBatteryStatus
          return {
            ...element,
            index,
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
    },
  })
}

export default useGetDevices
