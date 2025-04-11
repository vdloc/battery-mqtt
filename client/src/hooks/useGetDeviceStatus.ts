import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"

const url = API_URL.GET_DEVICES_STATUS
const useGetDeviceStatus = (params: { imei: string | undefined; timeStart: number; timeEnd: number }) => {
  return useQuery({
    queryKey: [url, params],
    queryFn: async () => {
      const res = await request({
        method: "POST",
        url,
        data: {
          ...params,
          limit: 100000,
        },
      })
      return res?.data?.result?.data
    },
    enabled: !!params && !!params.imei,
  })
}

export default useGetDeviceStatus
