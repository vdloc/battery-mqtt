import nodemailer from "nodemailer"
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from "../envConfigs"

export class MailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      })
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }
}
