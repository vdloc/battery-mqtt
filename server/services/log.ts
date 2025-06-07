import pino from "pino"

class Logger {
  logger: pino.Logger
  /**
   *
   */
  constructor() {
    this.logger = pino(
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
      pino.destination("./output.log")
    )
  }
}

export const log = new Logger().logger.info
