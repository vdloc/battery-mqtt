import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useMutation } from "@tanstack/react-query"
const url = API_URL.SIGNUP
const useSignup = () => {
  return useMutation({

    mutationFn: async (data: any) => {
      const res = await request({
        method: "POST",
        url,
        data,
      })
      return res
    },
  })
}

export default useSignup
