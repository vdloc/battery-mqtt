import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"

const url = API_URL.GET_DEVICES_STATUS
const useGetDeviceStatus = (params: { imei: string | undefined | null; timeStart: number; timeEnd: number }) => {
  const navigate = useNavigate()
  return useQuery({
    queryKey: [url, params],
    queryFn: async () => {
      try {
        const res = await requestToken({
          method: "GET",
          url,
          params: {
            input: JSON.stringify({ ...params, limit: 100000 }),
          },
        })

        const result = res?.data?.result?.data?.[0]
        let resultConfig: any[] = []
        for (let i = 0; i < result.length; i++) {
          const resultConfigLatest = resultConfig[resultConfig.length - 1]
          if (!resultConfigLatest || (resultConfigLatest && result[i] && resultConfigLatest.time !== result[i].time)) {
            resultConfig.push(result[i])
          }
        }
        return resultConfig
      } catch (error: any) {
        if (error.response.status === 401) {
          navigate("/login")
        }
        return undefined
      }
    },
    enabled: !!params && !!params.imei,
  })
}

export default useGetDeviceStatus
