import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"

const url = API_URL.GET_USER
const useGetUser = () => {
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await request({
        method: "GET",
        url,
        params: {
          input: JSON.stringify({ page: 1 }),
        },
      })
      return res.data
    },
  })
}

export default useGetUser
