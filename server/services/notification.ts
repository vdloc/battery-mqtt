import { BatteryStatusResponse } from "../types/Response"
import { CronJobService } from "./cron"
import { databaseService } from "./database"
import { mailService } from "./mail"

class NotificationService {
  private t1: number = 0
  private t2: number = 0
  private t3: number = 0
  private devices: { [key: string]: any } = {}

  constructor() {
    this.updateTimes()
  }

  async updateTimes() {
    const times = await databaseService.getNotificationSetting()
    this.t1 = times.t1
    this.t2 = times.t2
    this.t3 = times.t3
  }

  async checkAndSendNotification(input: BatteryStatusResponse) {
    if (!this.devices[input.imei]) {
      const device = await databaseService.getDevice(input.imei)
      const channel = await databaseService.getSetupChannel(input.imei)
      const { enableNotification, manageUnitName, manageUnitId } = device

      this.devices[input.imei] = {
        enableNotification,
        channel: channel?.usingChannel,
        lastBatteryStatus: input,
        isDownTrend: false,
        isSendDowntrendEmail: false,
        manageUnitName,
        manageUnitId,
      }
    }

    const { infor } = input
    const { lastBatteryStatus, manageUnitName, manageUnitId } = this.devices[input.imei]

    const dischargingChannel = Object.keys(infor).find((channel) => {
      const { Ampere } = infor[channel]
      const { Ampere: lastAmpere } = lastBatteryStatus.infor[channel]

      return Ampere < 0 && lastAmpere < 0 && Ampere < lastAmpere
    })

    this.devices[input.imei].isDownTrend = !!dischargingChannel

    if (!this.devices[input.imei].isDownTrend || !dischargingChannel) return
    const employees = await databaseService.getEmployees(manageUnitId)

    if (!this.devices[input.imei].isSendDowntrendEmail) {
      CronJobService.timeout(this.t1 * 60000, async () => {
        employees.forEach((employee: any) => {
          mailService.sendDowntrendEmail({
            to: employee.email,
            manageUnitName,
            t1: this.t1,
            ampere: infor[dischargingChannel].Ampere,
            voltage: infor[dischargingChannel].Voltage,
          })
        })
      })
      this.devices[input.imei].isSendDowntrendEmail = true
    }
  }
}
const notificationService = new NotificationService()
export default notificationService
