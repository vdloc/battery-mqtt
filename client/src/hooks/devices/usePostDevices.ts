import { requestToken } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"

export enum DeviceType {
  CREATE_DEVICE = "CREATE_DEVICE",
  UPDATE_DEVICE = "UPDATE_DEVICE",
  DELETE_DEVICE = "DELETE_DEVICE",
}

const usePostDevices = (type: DeviceType) => {
  const url = API_URL[type]
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        const res = await requestToken({
          method: "POST",
          url,
          data,
        })
        return res?.data?.result?.data
      } catch (error: any) {
        if (error.response.status === 401) {
          navigate("/login")
        }
        return undefined
      }
    },
  })
}

export default usePostDevices
