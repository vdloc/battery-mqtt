import dayjs from "dayjs"

export function formatDateAxis(timestamp: number) {
  return dayjs(timestamp).format("HH:mm:ss")
}
export function formatDate(timestamp: string) {
  return dayjs(timestamp).format("HH:mm:ss DD/MM/YYYY")
}
