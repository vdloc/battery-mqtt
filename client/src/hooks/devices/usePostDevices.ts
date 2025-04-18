import { request } from "@/utils/api/axios"
import API_URL from "@/utils/api/url"
import { useMutation } from "@tanstack/react-query"

export enum DeviceType {
  CREATE_DEVICE = "CREATE_DEVICE",
  UPDATE_DEVICE = "UPDATE_DEVICE",
  DELETE_DEVICE = "DELETE_DEVICE",
}

const usePostDevices = (type: DeviceType) => {
  const url = API_URL[type]
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await request({
        method: "POST",
        url,
        data,
      })
      return res?.data?.result?.data
    },
  })
}

export default usePostDevices
