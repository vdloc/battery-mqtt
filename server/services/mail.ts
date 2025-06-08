import nodemailer from "nodemailer"
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from "../envConfigs"

class MailService {
  private transporter: nodemailer.Transporter
  private static DISCHARGING_SUBJECT = "Cảnh báo trạm mất điện"
  private static CHARGING_SUBJECT = "Thông báo trạm có điện trở lại"

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      let result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      })
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }

  async sendDowntrendEmail({
    to,
    manageUnitName,
    t1,
    ampere,
    voltage,
  }: {
    to: string
    manageUnitName: string
    t1: number
    ampere: number
    voltage: number
  }): Promise<void> {
    const html = `
    <p>${new Date().toUTCString()}-${manageUnitName}-discharing in ${t1 * 60 * 1000}s-${voltage}V-${ampere}A}</p>`

    try {
      await this.sendMail(to, MailService.DISCHARGING_SUBJECT, html)
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }

  async sendDischarginEmail({
    to,
    manageUnitName,
    ampere,
    voltage,
  }: {
    to: string
    manageUnitName: string
    ampere: number
    voltage: number
  }): Promise<void> {
    const html = `
    <p>${new Date().toUTCString()}-${manageUnitName}-${voltage}V-${ampere}A}</p>`

    try {
      await this.sendMail(to, MailService.DISCHARGING_SUBJECT, html)
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }

  async sendUpTrendEmail({
    to,
    manageUnitName,
    ampere,
    voltage,
  }: {
    to: string
    manageUnitName: string
    ampere: number
    voltage: number
  }): Promise<void> {
    const html = `
    <p>${new Date().toUTCString()}-${manageUnitName}-${voltage}V-${ampere}A}</p>`

    try {
      await this.sendMail(to, MailService.CHARGING_SUBJECT, html)
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }
}

export const mailService = new MailService()
