import { protectedProcedure, publicProcedure, router } from "../trpc"
import { z } from "zod"
import { schema } from "@fsb/drizzle"
import { drizzleOrm } from "@fsb/drizzle"
import { OPERATORS, Topic } from "../types/Topic"

import { cronjobService } from "../services/cron"
import { mqttService } from "../services/mqtt"

const { desc, eq } = drizzleOrm

const inputSchema = z.object({
  imei: z.string(),
  operator: z.string(),
  infor: z.object({
    BatteryStatusInterval: z.number().optional(),
    DeviceStatusInterval: z.number().optional(),
    usingChannel: z.string().optional(),
  }),
  time: z.number(),
})

const { deviceIntervalTable, setupChannelTable } = schema
const brokerRouter = router({
  request: publicProcedure
    .input(inputSchema)
    .output(inputSchema)
    .meta({ summary: "Gui request den gateway" })
    .query(async ({ ctx, input }) => {
      const {
        imei,
        operator,
        infor: { BatteryStatusInterval, DeviceStatusInterval, usingChannel },
        time,
      } = input
      const db = ctx.db
      switch (operator) {
        case OPERATORS.SET_INTERVAL:
          // Update vao DB
          await db
            .update(deviceIntervalTable)
            .set({
              batteryStatusInterval: BatteryStatusInterval,
              deviceStatusInterval: DeviceStatusInterval,
              time,
            })
            .where(eq(deviceIntervalTable.imei, imei))
          // Update vao mqtt
          mqttService.publish({
            topic: `${Topic.REQUEST}/${imei}`,
            message: {
              time: Date.now(),
              operator: OPERATORS.SET_INTERVAL,
              infor: {
                BatteryStatusInterval: BatteryStatusInterval,
                DeviceStatusInterval: DeviceStatusInterval,
              },
            },
          })
          // Update  cronjob
          cronjobService.updateTask(imei, BatteryStatusInterval || 30, DeviceStatusInterval || 30)
          return input
        case OPERATORS.SETUP_CHANNEL:
          await db
            .update(setupChannelTable)
            .set({
              usingChannel: usingChannel,
              time,
            })
            .where(eq(setupChannelTable.imei, imei))
          mqttService.publish({
            topic: `${Topic.REQUEST}/${imei}`,
            message: {
              time: Date.now(),
              operator: OPERATORS.SETUP_CHANNEL,
              infor: {
                usingChannel: usingChannel,
              },
            },
          })
          return input
        default:
          throw new Error("Invalid operator")
      }
    }),
  getDevices: publicProcedure.query(async ({ ctx }) => {
    const db = ctx.db
    return await db.query.brokerDeviceTable.findMany({
      limit: 100,
    })
  }),
  getIntervals: publicProcedure.query(async ({ ctx }) => {
    const db = ctx.db

    return await db.query.deviceIntervalTable.findMany({
      orderBy: [desc(deviceIntervalTable.time)],
      limit: 100,
    })
  }),
  getDeviceSetupChannels: publicProcedure.query(async ({ ctx, input }) => {
    const db = ctx.db

    return await db.query.setupChannelTable.findMany({
      orderBy: [desc(deviceIntervalTable.time)],
      limit: 100,
    })
  }),
})

export default brokerRouter
