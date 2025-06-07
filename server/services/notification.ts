import { BatteryStatusResponse } from "../types/Response"
import { CronJobService } from "./cron"
import { databaseService } from "./database"
import { log } from "./log"
import { mailService } from "./mail"

class NotificationService {
  private devices: { [key: string]: any } = {}
  private settings: { [key: string]: any } = {}

  constructor() {
    this.getSettings()
  }

  async getSettings() {
    const settings = await databaseService.getAllNotificationSetting()
    settings.forEach((setting: any) => {
      this.settings[setting.manageUnitId] = setting
    })
  }

  async checkAndSendNotification(input: BatteryStatusResponse) {
    await this.setDeviceData(input)
    await this.setSettingsData(input)

    const { infor } = input // Current  battery status information
    const { lastBatteryStatus, manageUnitName, manageUnitId } = this.devices[input.imei]
    const { t1, t2, t3 } = this.settings[manageUnitId]

    const dischargingChannel = Object.keys(infor).find((channel) => {
      const { Ampere } = infor[channel]
      const { Ampere: lastAmpere } = lastBatteryStatus.infor[channel]
      log(`${Ampere} < ${lastAmpere}`)
      log(JSON.stringify(this.devices[input.imei]))

      return Ampere < lastAmpere
    })

    this.devices[input.imei].isDownTrend = !!dischargingChannel

    if (!this.devices[input.imei].isDownTrend || !dischargingChannel) return
    const employees = await databaseService.getEmployees(manageUnitId)

    if (!this.devices[input.imei].isSendDowntrendEmail) {
      CronJobService.timeout(t1 * 60000, async () => {
        employees.forEach((employee: any) => {
          mailService.sendDowntrendEmail({
            to: employee.email,
            manageUnitName,
            t1: t1,
            ampere: infor[dischargingChannel].Ampere,
            voltage: infor[dischargingChannel].Voltage,
          })
        })
      })
      this.devices[input.imei].isSendDowntrendEmail = true
    }
  }

  async setDeviceData(input: BatteryStatusResponse) {
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
  }

  async setSettingsData(input: BatteryStatusResponse) {
    const { imei } = input
    const { manageUnitId } = this.devices[imei]
    const setting = this.settings[manageUnitId]

    if (!setting) {
      const setting = await databaseService.getNotificationSetting(manageUnitId)
      this.settings[manageUnitId] = setting
    }
  }
}
const notificationService = new NotificationService()
export default notificationService
