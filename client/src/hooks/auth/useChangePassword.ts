import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
const url = API_URL.UPDATE_USER_PASSWORD
const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await request({
        method: "POST",
        url,
        data,
      })
      if (res) {
        toast.success("Đổi mật khẩu thành công")
      }
      return res
    },
  })
}

export default useChangePassword
