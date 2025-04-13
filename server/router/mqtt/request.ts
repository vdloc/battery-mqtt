import z from "zod"
import { publicProcedure } from "../../trpc"
import { OPERATORS, Topic } from "../../types/Topic"
import { databaseService } from "../../services/database"
import { mqttService } from "../../services/mqtt"
import { cronjobService } from "../../services/cron"
import { schema } from "@fsb/drizzle"
import { drizzleOrm } from "@fsb/drizzle"

const { eq } = drizzleOrm
const { setupChannelTable } = schema
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

export default publicProcedure
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
        databaseService.updateDeviceInterval({
          imei,
          batteryStatusInterval: BatteryStatusInterval,
          deviceStatusInterval: DeviceStatusInterval,
          time,
        })
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
        // Demo only
        mqttService.publish({
          topic: Topic.RESPONSE,
          message: {
            time: Date.now(),
            operator: OPERATORS.SET_INTERVAL,
            infor: {
              BatteryStatusInterval: BatteryStatusInterval,
              DeviceStatusInterval: DeviceStatusInterval,
            },
            imei,
          },
        })
        // Demo only
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
        // Demo only
        mqttService.publish({
          topic: Topic.RESPONSE,
          message: {
            time: Date.now(),
            operator: OPERATORS.SETUP_CHANNEL,
            infor: {
              usingChannel: usingChannel,
            },
          },
          imei,
        })
        return input
      default:
        throw new Error("Invalid operator")
    }
  })
