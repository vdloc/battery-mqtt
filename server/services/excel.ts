import { databaseService } from "./database"

interface ExcelInput {
  imei?: string
  timeStart: number
  timeEnd: number
  imeiList?: string[]
}
class ExcelService {
  async getExcelData(input: ExcelInput) {
    const statusData = await databaseService.getDeviceStatus(input);
  }
}
