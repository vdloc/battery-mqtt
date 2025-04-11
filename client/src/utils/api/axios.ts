/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from "axios"

export const VITE_BASE_URL = "http://api.battery.work.gd"

const instanceAxios = {
  baseURL: VITE_BASE_URL,
}

const axiosConfig = axios.create(instanceAxios)

const request = ({ method, url, data, ...rest }: AxiosRequestConfig) =>
  axiosConfig({
    method: method,
    url: url,
    data: data,
    ...rest,
  })

const requestToken = ({ method, url, data, ...rest }: AxiosRequestConfig) => {
  const token = localStorage.getItem("battery_token")
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
