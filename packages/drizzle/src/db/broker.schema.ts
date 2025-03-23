import { pgTable, integer, uuid, timestamp, varchar } from "drizzle-orm/pg-core"

export const brokerDeviceTable = pgTable("device", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar({ length: 50 }).notNull(),
})

export const deviceIntervalTable = pgTable("device_interval", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull(),
  batteryStatusInterval: integer(),
  deviceStatusInterval: integer(),
  lastUpdate: timestamp(),
})

export const setupChannelTable = pgTable("setup_channel", {
  id: uuid().defaultRandom().primaryKey(),
  imei: varchar()
    .references(() => brokerDeviceTable.imei)
    .notNull(),
  usingChannel: varchar({ length: 4 }).notNull(),
  lastUpdate: timestamp({ mode: "string" }),
})
