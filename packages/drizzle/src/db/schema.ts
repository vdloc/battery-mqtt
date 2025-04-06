import { pgTable, text, integer, uuid, timestamp, varchar, bigserial, jsonb, bigint } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const userTable = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  name: text("name").notNull(),
  age: integer(),
  image: text("image"),
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

export const brokerDeviceTable = pgTable("mqtt_device", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar({ length: 50 }).notNull().unique(),
  lastBatteryStatus: jsonb(),
  lastGatewayStatus: jsonb(),
})

export const deviceIntervalTable = pgTable("mqtt_device_interval", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull(),
  batteryStatusInterval: integer().notNull(),
  deviceStatusInterval: integer().notNull(),
  time: bigint({ mode: "number" }).notNull(),
})

export const setupChannelTable = pgTable("mqtt_setup_channel", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull(),
  usingChannel: varchar({ length: 4 }).notNull(),
  time: bigint({ mode: "number" }).notNull(),
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
