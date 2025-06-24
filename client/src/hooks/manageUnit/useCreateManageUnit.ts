import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
const url = API_URL.CREATE_MANAGE_UNIT
const useCreateManageUnit = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        const res = await requestToken({
          method: "POST",
          url,
          data,
        })
        return res
      } catch (error: any) {
        if (error.response.status === 401) {
          navigate("/login")
        }
        return undefined
      }
    },
  })
}

export default useCreateManageUnit
