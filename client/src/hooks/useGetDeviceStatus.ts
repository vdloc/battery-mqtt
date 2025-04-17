import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"

const url = API_URL.GET_DEVICES_STATUS
const useGetDeviceStatus = (params: { imei: string | undefined | null; timeStart: number; timeEnd: number }) => {
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

      const result = res?.data?.result?.data
      let resultConfig: any[] = []
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].length; j++) {
          const resultConfigLatest = resultConfig[resultConfig.length - 1]
          if (
            !resultConfigLatest ||
            (resultConfigLatest && result[i][j] && resultConfigLatest.time !== result[i][j].time)
          ) {
            resultConfig.push(result[i][j])
          }
        }
      }
      return resultConfig
    },
    enabled: !!params && !!params.imei,
  })
}

export default useGetDeviceStatus
