/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from "axios"
import Cookies from "js-cookie"

// export const VITE_BASE_URL = "http://localhost:4000"
export const VITE_BASE_URL = import.meta.env.VITE_URL_BACKEND

const instanceAxios = {
  baseURL: VITE_BASE_URL,
}

axios.defaults.withCredentials = true

const axiosConfig = axios.create(instanceAxios)

const request = ({ method, url, data, ...rest }: AxiosRequestConfig) =>
  axiosConfig({
    method: method,
    url: url,
    data: data,
    ...rest,
  })

const requestToken = ({ method, url, data, ...rest }: AxiosRequestConfig) => {
  const token = Cookies.get("battery-auth")
  return axiosConfig({
    method: method,
    url: url,
    data: data,
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
    ...rest,
  })
}

export { request, requestToken }
