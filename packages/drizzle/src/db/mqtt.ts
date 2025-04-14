import { pgTable, text, integer, uuid, timestamp, varchar, bigserial, jsonb, bigint } from "drizzle-orm/pg-core"
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

export const manageUnitTable = pgTable("mqtt_manage_unit", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
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
