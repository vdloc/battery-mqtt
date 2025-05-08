import z from "zod"
import { protectedProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  imei: z.string(),
  timeStart: z.number(),
  timeEnd: z.number(),
  limit: z.number().optional(),
})

export default protectedProcedure.input(inputSchema).query(async ({ ctx, input }) => {
  const { imei, timeStart, timeEnd, limit } = input

  const batteryStatuses = await databaseService.getDeviceStatus({
    imei,
    timeStart,
    timeEnd,
    limit: limit || 50,
  })

  return batteryStatuses
})
