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
  manageUnitTable,
} from "../db/schema"
import dotenv from "dotenv"
import citiesData from "./cities.json"
import { faker } from "@faker-js/faker"
import { eq } from "drizzle-orm"
dotenv.config({ path: "../../server.env" })
const databaseUrl = process.env.DATABASE_URL!

const main = async () => {
  console.log(`Seeding ${databaseUrl}...`)
  const db = drizzle(databaseUrl)
  // await db.delete(userCredentialTable)
  // await db.delete(deviceTable)
  // await db.delete(userTable)
  // await db.delete(deviceIntervalTable)
  // await db.delete(setupChannelTable)
  // await db.delete(batteryStatusTable)
  // await db.delete(gatewayStatusTable)
  // await db.delete(brokerDeviceTable)
  // for (const user of initUsersData) {
  //   let users = await db.insert(userTable).values(user).returning({ id: userTable.id })
  //   await db.insert(userCredentialTable).values({
  //     userId: users[0].id,
  //     passwordHash: user.password,
  //   })
  // }

  // for (const device of devices) {
  //   await db.insert(brokerDeviceTable).values(device)
  // }

  // for (const statusInverval of deviceStatusIntervals) {
  //   await db.insert(deviceIntervalTable).values(statusInverval)
  // }

  // for (const setupChannel of deviceSetupChannels) {
  //   await db.insert(setupChannelTable).values(setupChannel)
  // }
  // Object.values(citiesData).forEach(async (city) => {
  //   const { name } = city
  //   await db.insert(manageUnitTable).values({
  //     name,
  //   })
  // })
  let manageUnits = await db
    .select({
      id: manageUnitTable.id,
      name: manageUnitTable.name,
    })
    .from(manageUnitTable)
  let imeis = await db
    .select({
      imei: brokerDeviceTable.imei,
      id: brokerDeviceTable.id,
    })
    .from(brokerDeviceTable)
  for (const imei of imeis) {
    const manageUnit = faker.helpers.arrayElement(manageUnits)
    const data = {
      simNumber: faker.phone.number({ style: "national" }),
      manageUnitId: manageUnit.id,
      manageUnitName: manageUnit.name,
      aliasName: faker.company.name(),
      stationCode: faker.string.alphanumeric(10),
    }
    const result = await db.update(brokerDeviceTable).set(data).where(eq(brokerDeviceTable.id, imei.id)).returning({
      id: brokerDeviceTable.id,
      imei: brokerDeviceTable.imei,
      manageUnitId: brokerDeviceTable.manageUnitId,
      manageUnitName: brokerDeviceTable.manageUnitName,
      aliasName: brokerDeviceTable.aliasName,
      stationCode: brokerDeviceTable.stationCode,
    })
    console.log(" result:", result)
  }
  console.log(`Done!`)
  process.exit(0)
}
main()
