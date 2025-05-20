import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"

const url = API_URL.GET_DEVICES_STATUS
const useGetDeviceStatusToExport = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: { imei: string | undefined | null; timeStart: number; timeEnd: number }) => {
      try {
        const res = await requestToken({
          method: "GET",
          url,
          params: {
            input: JSON.stringify({ ...params, limit: 100000 }),
          },
        })

        const result = res?.data?.result?.data[0]
        result.sort((a: any, b: any) => b.time - a.time)
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
  })
}

export default useGetDeviceStatusToExport
