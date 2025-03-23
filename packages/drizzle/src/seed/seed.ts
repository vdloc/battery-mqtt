import { initUsersData } from "./initUsersData"
import { devices, deviceStatusIntervals } from "./initDeviceData"
import { drizzle } from "drizzle-orm/node-postgres"
import { userTable, deviceTable, userCredentialTable } from "../db/schema"
import { brokerDeviceTable, deviceIntervalTable, setupChannelTable } from "../db/broker.schema"
import dotenv from "dotenv"
dotenv.config({ path: "../../server.env" })
const databaseUrl = process.env.DATABASE_URL!

const main = async () => {
  console.log(`Seeding ${databaseUrl}...`)
  const db = drizzle(databaseUrl)
  await db.delete(userCredentialTable)
  await db.delete(deviceTable)
  await db.delete(userTable)
  for (const user of initUsersData) {
    let users = await db.insert(userTable).values(user).returning({ id: userTable.id })
    await db.insert(userCredentialTable).values({
      userId: users[0].id,
      passwordHash: user.password,
    })
  }

  for (const device of devices) {
    console.log(" device:", device)
    await db.insert(brokerDeviceTable).values(device)
  }

  for (const statusInverval of deviceStatusIntervals) {
    await db.insert(deviceIntervalTable).values(statusInverval)
  }

  console.log(`Done!`)
  process.exit(0)
}
main()
