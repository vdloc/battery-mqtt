import dotenv from "dotenv"
dotenv.config({ path: "../server.env" })

export const {
  DATABASE_URL,
  JWT_SECRET,
  CLIENT_URL,
  CLIENT_API_URL,
  NODE_ENV,
  PORT,
  BROKER_URL,
  BROKER_USERNAME,
  BROKER_PASSWORD,
  BROKER_PORT,
  BROKER_PROTOCOL,
  WS_HOST,
  WS_PORT,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} = process.env
