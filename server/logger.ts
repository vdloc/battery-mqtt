import fs from "fs"
import { pino } from "pino"

const logStream = fs.createWriteStream("./application.log", { flags: "a" })
const logger = pino({}, logStream)

export default logger
