import { schedule } from "node-cron"
import { DATABASE_URL } from "./envConfigs"
import { schema } from "@fsb/drizzle"
import { drizzle } from "drizzle-orm/node-postgres"

const { deviceIntervalTable, brokerDeviceTable } = schema
let dbUrl = `${DATABASE_URL}`
// Initialize a database connection (assuming opts.ctx.db is your database instance)
const db = drizzle(dbUrl, { schema })

async function getDevices() {
  const device = await db.query.deviceIntervalTable.findMany({
    columns: { id: true, imei: true },
  })
  console.log(" db.query:", db.query)
}

getDevices()
