import pino from "pino"
import fs from "fs"

const fileStream = fs.createWriteStream("./output.log", { flags: "a" })
const logger = pino(
  {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  },
  pino.multistream([
    { stream: process.stdout }, // Console output
    { stream: fileStream }, // File output
  ])
)

export const log = logger.info.bind(logger)
