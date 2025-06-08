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
    if (!this.devices[input.imei]) {
      await this.setDeviceData(input)
    } else {
      this.devices[input.imei].lastBatteryStatus = input
    }
    await this.setSettingsData(input)

    const dischargingChannel = await this.getDischargingChannel(input)
    const deviceData = this.devices[input.imei]
    deviceData.isDownTrend = !!dischargingChannel

    if (!deviceData.isDownTrend || !dischargingChannel) return
    const { manageUnitName, manageUnitId } = deviceData
    const employees = await databaseService.getEmployees(manageUnitId)
    const { t1, t2, t3 } = this.settings[manageUnitId]

    if (!deviceData.isSendDowntrendEmail) {
      CronJobService.timeout(t1 * 60000, async () => {
        employees.forEach((employee: any) => {
          mailService.sendDowntrendEmail({
            to: employee.email,
            manageUnitName,
            t1: t1,
            ampere: input.infor[dischargingChannel].Ampere,
            voltage: input.infor[dischargingChannel].Voltage,
          })
        })
      })
      deviceData.isSendDowntrendEmail = true
      return
    }

    if (deviceData.isSendDowntrendEmail && !deviceData.isSendDischargingEmail) {
      deviceData.dischargingTimeout = CronJobService.schedule(t2 * 60000, async () => {
        employees.forEach((employee: any) => {
          mailService.sendDischarginEmail({
            to: employee.email,
            manageUnitName,
            ampere: input.infor[dischargingChannel].Ampere,
            voltage: input.infor[dischargingChannel].Voltage,
          })
        })
      })
      deviceData.isSendDischargingEmail = true
      return
    }

    clearInterval(deviceData.dischargingTimeout)
    deviceData.dischargingTimeout = CronJobService.schedule(t3 * 60000, async () => {
      employees.forEach((employee: any) => {
        mailService.sendUpTrendEmail({
          to: employee.email,
          manageUnitName,
          ampere: input.infor[dischargingChannel].Ampere,
          voltage: input.infor[dischargingChannel].Voltage,
        })
      })
    })
    deviceData.isSendDischargingEmail = false
    deviceData.isSendDowntrendEmail = false
    deviceData.isDownTrend = false
  }

  async setDeviceData(input: BatteryStatusResponse) {
    const device = await databaseService.getDevice(input.imei)
    const channel = await databaseService.getSetupChannel(input.imei)
    const { enableNotification, manageUnitName, manageUnitId } = device

    this.devices[input.imei] = {
      enableNotification,
      channel: channel?.usingChannel,
      lastBatteryStatus: input,
      isDownTrend: false,
      isSendDowntrendEmail: false,
      isSendDischargingEmail: false,
      dischargingTimeout: null,
      manageUnitName,
      manageUnitId,
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

  async getDischargingChannel(input: BatteryStatusResponse) {
    const { infor } = input // Current  battery status information
    const { lastBatteryStatus } = this.devices[input.imei]

    const dischargingChannel = Object.keys(infor).find((channel) => {
      const { Ampere } = infor[channel]
      const { Ampere: lastAmpere } = lastBatteryStatus.infor[channel]

      return lastAmpere < 0 && Ampere < lastAmpere
    })

    return dischargingChannel
  }
}
const notificationService = new NotificationService()
export default notificationService
