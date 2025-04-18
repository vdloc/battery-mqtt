import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"
const url = API_URL.GET_MANAGE_UNITS
const useGetManageUnits = () => {
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await request({
        method: "GET",
        url,
      })
      return res?.data?.result?.data.map((item: any) => {
        return {
          ...item,
          value: item.id,
          label: item.name,
        }
      })
    },
  })
}

export default useGetManageUnits
