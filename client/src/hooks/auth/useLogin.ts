import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useNavigate } from "react-router"
const url = API_URL.LOGIN
const useLogin = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await request({
        method: "POST",
        url,
        data,
      })
      if (res) {
        navigate("/")
        toast.success("Đăng nhập thành công")
      }
      return res
    },
  })
}

export default useLogin
