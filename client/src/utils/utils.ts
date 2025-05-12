/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export const exportToExcel = (data: any[], fileName = "export") => {
  // Create a worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

  // Create a Blob and trigger download
  const file = new Blob([excelBuffer], { type: "application/octet-stream" })
  saveAs(file, `${fileName}.xlsx`)
}
const utils = {
  sanitizePage: (page: string | null) => {
    if (!page) return 1
    const pageNumber = parseInt(page)
    if (isNaN(pageNumber)) return 1
    if (pageNumber < 1) return 1
    return pageNumber
  },

  getDeviceName: (userAgent: string) => {
    if (/iPhone/i.test(userAgent)) return "iPhone"
    if (/iPad/i.test(userAgent)) return "iPad"
    if (/Android/i.test(userAgent)) return "Android Device"
    if (/Windows/i.test(userAgent)) return "Windows PC"
    if (/Macintosh|MacIntel/i.test(userAgent)) return "Mac"
    if (/Linux/i.test(userAgent)) return "Linux PC"
    if (/CrOS/i.test(userAgent)) return "Chromebook"

    return ""
  },
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export default utils
