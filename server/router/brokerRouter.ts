import { protectedProcedure, publicProcedure, router } from "../trpc"
import { z } from "zod"
import { schema } from "@fsb/drizzle"
import { drizzleOrm } from "@fsb/drizzle"
import { OPERATORS } from "../type/Topic.type"
import { brokerApi, Topic } from "../api/brokerApi"
import { brokerDeviceTable } from "@fsb/drizzle/src/db/schema"
import { cronjob } from "../cron"
const { count, desc, eq } = drizzleOrm

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
      console.log(" input:", input)
      const {
        imei,
        operator,
        infor: { BatteryStatusInterval, DeviceStatusInterval, usingChannel },
        time,
      } = input
      const db = ctx.db
      switch (operator) {
        case OPERATORS.SET_INTERVAL:
          await db
            .update(deviceIntervalTable)
            .set({
              batteryStatusInterval: BatteryStatusInterval,
              deviceStatusInterval: DeviceStatusInterval,
              lastUpdate: new Date(time),
            })
            .where(eq(deviceIntervalTable.imei, imei))
          brokerApi.publish({
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
          cronjob.updateTask(imei, BatteryStatusInterval || 30, DeviceStatusInterval || 30)
          return input
        case OPERATORS.SETUP_CHANNEL:
          await db
            .update(setupChannelTable)
            .set({
              usingChannel: usingChannel,
              lastUpdate: new Date(time),
            })
            .where(eq(setupChannelTable.imei, imei))
          brokerApi.publish({
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
      orderBy: [desc(deviceIntervalTable.lastUpdate)],
      limit: 100,
    })
  }),
  getDeviceSetupChannels: publicProcedure.query(async ({ ctx, input }) => {
    const db = ctx.db

    return await db.query.setupChannelTable.findMany({
      orderBy: [desc(deviceIntervalTable.lastUpdate)],
      limit: 100,
    })
  }),
})

export default brokerRouter
