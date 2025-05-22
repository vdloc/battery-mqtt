import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"

const url = API_URL.GET_EMPLOYEES
const useGetEmployee = (manageUnitId: string | undefined) => {
  const navigate = useNavigate()
  return useQuery({
    queryKey: [url, manageUnitId],
    queryFn: async () => {
      try {
        const res = await requestToken({
          method: "GET",
          url,
          params: {
            input: JSON.stringify({ manageUnitId, page: 1, limit: 100000 }),
          },
        })
        return res.data?.result?.data
      } catch (error: any) {
        if (error.response.status === 401) {
          navigate("/login")
        }
        return undefined
      }
    },
    enabled: !!manageUnitId,
  })
}

export default useGetEmployee
