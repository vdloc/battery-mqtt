import fs from "fs"
import { pino } from "pino"

// Create a writable stream to a log file
const logStream = fs.createWriteStream("./application.log", { flags: "a" })

// Create a Pino logger instance with the writable stream
const logger = pino({}, logStream)

export default logger
