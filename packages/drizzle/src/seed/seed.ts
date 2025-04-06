import { initUsersData } from "./initUsersData"
import { devices, deviceStatusIntervals, deviceSetupChannels } from "./initDeviceData"
import { drizzle } from "drizzle-orm/node-postgres"
import {
  userTable,
  deviceTable,
  userCredentialTable,
  brokerDeviceTable,
  deviceIntervalTable,
  setupChannelTable,
  batteryStatusTable,
  gatewayStatusTable,
} from "../db/schema"
import dotenv from "dotenv"
dotenv.config({ path: "../../server.env" })
const databaseUrl = process.env.DATABASE_URL!

const main = async () => {
  console.log(`Seeding ${databaseUrl}...`)
  const db = drizzle(databaseUrl)
  await db.delete(userCredentialTable)
  await db.delete(deviceTable)
  await db.delete(userTable)
  await db.delete(deviceIntervalTable)
  await db.delete(setupChannelTable)
  await db.delete(batteryStatusTable)
  await db.delete(gatewayStatusTable)
  await db.delete(brokerDeviceTable)
  for (const user of initUsersData) {
    let users = await db.insert(userTable).values(user).returning({ id: userTable.id })
    await db.insert(userCredentialTable).values({
      userId: users[0].id,
      passwordHash: user.password,
    })
  }

  for (const device of devices) {
    await db.insert(brokerDeviceTable).values(device)
  }

  for (const statusInverval of deviceStatusIntervals) {
    await db.insert(deviceIntervalTable).values(statusInverval)
  }

  for (const setupChannel of deviceSetupChannels) {
    await db.insert(setupChannelTable).values(setupChannel)
  }

  console.log(`Done!`)
  process.exit(0)
}
main()
