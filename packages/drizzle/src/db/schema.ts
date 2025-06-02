import {
  pgTable,
  text,
  integer,
  uuid,
  timestamp,
  varchar,
  bigserial,
  jsonb,
  bigint,
  boolean,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const brokerDeviceTable = pgTable("mqtt_device", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar({ length: 50 }).notNull().unique(),
  lastBatteryStatus: jsonb(),
  lastGatewayStatus: jsonb(),
  aliasName: varchar({ length: 200 }),
  stationCode: varchar({ length: 50 }),
  manageUnitId: uuid().references(() => manageUnitTable.id),
  manageUnitName: varchar({ length: 100 }),
  simNumber: varchar({ length: 15 }),
  time: bigint({ mode: "number" }).notNull(),
  enableNotification: boolean().notNull().default(false),
})

export const deviceIntervalTable = pgTable("mqtt_device_interval", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull()
    .unique(),
  batteryStatusInterval: integer().notNull(),
  deviceStatusInterval: integer().notNull(),
  time: bigint({ mode: "number" }).notNull(),
})

export const setupChannelTable = pgTable("mqtt_setup_channel", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull()
    .unique(),
  usingChannel: varchar({ length: 4 }).notNull(),
  time: bigint({ mode: "number" }).notNull(),
})

export const notificationSettingTable = pgTable("mqtt_notification_setting", {
  id: uuid().defaultRandom().primaryKey(),
  manageUnitId: uuid().references(() => manageUnitTable.id),
  t1: bigint({ mode: "number" }).notNull(),
  t2: bigint({ mode: "number" }).notNull(),
  t3: bigint({ mode: "number" }).notNull(),
})

export const batteryStatusTable = pgTable("mqtt_battery_status", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull(),
  infor: jsonb("infor").notNull(),
  time: bigint({ mode: "number" }).notNull(),
})

export const gatewayStatusTable = pgTable("mqtt_gateway_status", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull(),
  infor: jsonb("infor").notNull(),
  time: bigint({ mode: "number" }).notNull(),
})

export const deviceIntervalRelations = relations(brokerDeviceTable, ({ one }) => ({
  user: one(deviceIntervalTable, {
    fields: [brokerDeviceTable.imei],
    references: [deviceIntervalTable.imei],
  }),
}))

export const deviceSetupChannelRelations = relations(brokerDeviceTable, ({ one }) => ({
  user: one(setupChannelTable, {
    fields: [brokerDeviceTable.imei],
    references: [setupChannelTable.imei],
  }),
}))

export const deviceBatteryStatusRelations = relations(brokerDeviceTable, ({ one }) => ({
  user: one(batteryStatusTable, {
    fields: [brokerDeviceTable.imei],
    references: [batteryStatusTable.imei],
  }),
}))

export const deviceGatewayStatusRelations = relations(brokerDeviceTable, ({ one }) => ({
  user: one(gatewayStatusTable, {
    fields: [brokerDeviceTable.imei],
    references: [gatewayStatusTable.imei],
  }),
}))

export const userTable = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
})

export const userToUserCredentialRelations = relations(userTable, ({ one }) => ({
  userCredential: one(userCredentialTable),
}))

export const userCredentialTable = pgTable("user_credential", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id),
  passwordHash: text("password_hash").notNull(),
})

export const userCredentialToUserRelations = relations(userCredentialTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userCredentialTable.userId],
    references: [userTable.id],
  }),
}))

export const manageUnitTable = pgTable("mqtt_manage_unit", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
})

export const employeeTable = pgTable("mqtt_employee", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull(),
  manageUnitId: uuid().references(() => manageUnitTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const roleTable = pgTable("role", {
  id: uuid().defaultRandom().primaryKey(),
  name: text("name").notNull(),
})

export const permissionTable = pgTable("permission", {
  id: uuid().defaultRandom().primaryKey(),
  name: text("name").notNull(),
})

export const userRoleTable = pgTable("user_role", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roleTable.id),
})

export const userManageUnitTable = pgTable("user_manage_unit", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  manageUnitId: uuid("manage_unit_id")
    .notNull()
    .references(() => manageUnitTable.id),
})

export const rolePermissionTable = pgTable("role_permission", {
  id: uuid().defaultRandom().primaryKey(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roleTable.id),
  permissionId: uuid("permission_id")
    .notNull()
    .references(() => permissionTable.id),
})

export const deviceTable = pgTable("device", {
  id: uuid().defaultRandom().primaryKey(),
  userAgent: text("userAgent").notNull(),
  ip: text("ip").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
})

export const deviceToUserRelations = relations(deviceTable, ({ one }) => ({
  user: one(userTable, {
    fields: [deviceTable.userId],
    references: [userTable.id],
  }),
}))

export const userToDevicesRelations = relations(userTable, ({ many }) => ({
  devices: many(deviceTable),
}))

export const manageUnitUserRelations = relations(userTable, ({ one }) => ({
  manageUnit: one(userManageUnitTable, {
    fields: [userTable.id],
    references: [userManageUnitTable.userId],
  }),
}))

export const userManageUnitRelations = relations(userManageUnitTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userManageUnitTable.userId],
    references: [userTable.id],
  }),
}))
