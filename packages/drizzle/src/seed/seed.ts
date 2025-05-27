import { initUsersData } from "./initUsersData"
import { devices, deviceStatusIntervals, deviceSetupChannels } from "./initDeviceData"
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
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
  roleTable,
  userRoleTable,
  permissionTable,
  rolePermissionTable,
  employeeTable,
  userManageUnitTable,
  notificationSettingTable,
} from "../db/schema"
import dotenv from "dotenv"
import citiesData from "./cities.json"
import { faker } from "@faker-js/faker"
import { eq, inArray } from "drizzle-orm"
import { Permissions } from "./../../../../server/types/Permissions"

dotenv.config({ path: "../../server.env" })
const databaseUrl = process.env.DATABASE_URL!

const main = async () => {
  console.log(`Seeding ${databaseUrl}...`)
  const db = drizzle(databaseUrl)

  for await (const fn of [resetData, createUserAndDevice, createManageUnits, createPermissions]) {
    await fn(db)
  }

  console.log(`Done!`)
  process.exit(0)
}

async function resetData(db: NodePgDatabase<Record<string, never>>) {
  for (const table of [
    userManageUnitTable,
    userCredentialTable,
    userRoleTable,
    deviceTable,
    userTable,
    deviceIntervalTable,
    setupChannelTable,
    batteryStatusTable,
    gatewayStatusTable,
    brokerDeviceTable,
    rolePermissionTable,
    roleTable,
    employeeTable,
    manageUnitTable,
    permissionTable,
    notificationSettingTable,
  ]) {
    await db.delete(table)
  }
}

async function createUserAndDevice(db: NodePgDatabase<Record<string, never>>) {
  for await (const user of initUsersData) {
    let users = await db.insert(userTable).values(user).returning({ id: userTable.id })
    await db.insert(userCredentialTable).values({
      userId: users[0].id,
      passwordHash: user.password,
    })
  }

  for await (const device of devices) {
    await db.insert(brokerDeviceTable).values(device)
  }

  for await (const statusInverval of deviceStatusIntervals) {
    await db.insert(deviceIntervalTable).values(statusInverval)
  }

  for await (const setupChannel of deviceSetupChannels) {
    await db.insert(setupChannelTable).values(setupChannel)
  }

  await db.insert(notificationSettingTable).values({
    t1: 5 * 60 * 1000,
    t2: 10 * 60 * 1000,
    t3: 15 * 60 * 1000,
  })
}

async function createManageUnits(db: NodePgDatabase<Record<string, never>>) {
  Object.values(citiesData).forEach(async (city) => {
    const { name } = city
    await db.insert(manageUnitTable).values({
      name,
    })
  })

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

    await db.update(brokerDeviceTable).set(data).where(eq(brokerDeviceTable.id, imei.id)).returning({
      id: brokerDeviceTable.id,
      imei: brokerDeviceTable.imei,
      manageUnitId: brokerDeviceTable.manageUnitId,
      manageUnitName: brokerDeviceTable.manageUnitName,
      aliasName: brokerDeviceTable.aliasName,
      stationCode: brokerDeviceTable.stationCode,
    })
  }

  for (const imei of imeis) {
    await db.update(brokerDeviceTable).set({ time: Date.now() }).where(eq(brokerDeviceTable.imei, imei.imei))
  }

  let users = await db
    .select({
      id: userTable.id,
    })
    .from(userTable)

  for (const user of users) {
    const manageUnit = faker.helpers.arrayElement(manageUnits)
    await db.insert(userManageUnitTable).values({
      userId: user.id,
      manageUnitId: manageUnit.id,
    })
  }
}

async function createPermissions(db: NodePgDatabase<Record<string, never>>) {
  for (const role of ["admin", "user"]) {
    await db.insert(roleTable).values({
      name: role,
    })
  }

  let permissions = Object.values(Permissions).map((permission) => ({ name: permission }))
  await db.insert(permissionTable).values(permissions)

  let manageUnits = await db
    .select({
      id: manageUnitTable.id,
      name: manageUnitTable.name,
    })
    .from(manageUnitTable)
  for (const manageUnit of manageUnits) {
    let employees = Array.from({ length: 10 }).map(() => ({
      manageUnitId: manageUnit.id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
    }))
    await db.insert(employeeTable).values(employees)
  }

  let roleAdmin = await db.select({ id: roleTable.id }).from(roleTable).where(eq(roleTable.name, "admin"))
  let roleUser = await db.select({ id: roleTable.id }).from(roleTable).where(eq(roleTable.name, "user"))

  let permissionIds = await db.select({ id: permissionTable.id }).from(permissionTable)
  let adminPermissions = permissionIds.map((permission) => ({
    roleId: roleAdmin[0].id,
    permissionId: permission.id,
  }))
  let userPermissionsIds = await db
    .select({ id: permissionTable.id, name: permissionTable.name })
    .from(permissionTable)
    .where(inArray(permissionTable.name, [Permissions.DEVICE_VIEW, Permissions.DEVICE_EXPORT]))
  let userPermissions = userPermissionsIds.map((permission) => ({
    roleId: roleUser[0].id,
    permissionId: permission.id,
  }))

  await db.insert(rolePermissionTable).values(adminPermissions)
  await db.insert(rolePermissionTable).values(userPermissions)

  let users = await db.select({ id: userTable.id, email: userTable.email }).from(userTable)
  let userRoles = users.map((user) => ({
    userId: user.id,
    roleId: user.email === "admin@example.com" ? roleAdmin[0].id : roleUser[0].id,
  }))
  await db.insert(userRoleTable).values(userRoles)
}

main()
