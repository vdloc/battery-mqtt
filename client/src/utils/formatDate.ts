import dayjs from "dayjs"

export function formatDateAxis(timestamp: number) {
  return dayjs(timestamp).format("HH:mm:ss")
}
