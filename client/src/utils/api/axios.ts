/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from "axios"

export const VITE_BASE_URL = import.meta.env.VITE_URL_BACKEND

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
