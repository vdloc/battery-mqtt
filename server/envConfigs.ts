import dotenv from "dotenv"
dotenv.config({ path: "../server.env" })

export const {
  DATABASE_URL,
  JWT_SECRET,
  CLIENT_URL,
  NODE_ENV,
  PORT,
  BROKER_URL,
  BROKER_USERNAME,
  BROKER_PASSWORD,
  BROKER_PORT,
  BROKER_PROTOCOL,
  WS_HOST,
  WS_PORT,
} = process.env
