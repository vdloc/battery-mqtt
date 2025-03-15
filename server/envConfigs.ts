import dotenv from "dotenv"
dotenv.config({ path: "../server.env" })

export const {
  DATABASE_URL,
  JWT_SECRET,
  CLIENT_URL,
  NODE_ENV,
  BROKER_URL,
  BROKER_USERNAME,
  BROKER_PASSWORD,
  BROKER_PORT,
  BROKER_PROTOCOL,
} = process.env
