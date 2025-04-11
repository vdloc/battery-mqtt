import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"

const url = API_URL.GET_DEVICES_SETUP_CHANNELS
const useGetDeviceSetupChannels = () => {
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await request({
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
    },
  })
}

export default useGetDeviceSetupChannels
