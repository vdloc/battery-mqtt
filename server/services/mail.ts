import nodemailer from "nodemailer"
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from "../envConfigs"

class MailService {
  private transporter: nodemailer.Transporter

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
      console.log(" result:", result)
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }
}

export const mailService = new MailService()
