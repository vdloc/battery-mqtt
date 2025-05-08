import z from "zod"
import { protectedProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  imei: z.string(),
  manageUnitId: z.string().optional(),
  aliasName: z.string().optional(),
  stationCode: z.string().optional(),
  simNumber: z.string().optional(),
  batteryStatusInterval: z.number(),
  deviceStatusInterval: z.number(),
  usingChannel: z.string(),
  time: z.number().optional(),
})

export default protectedProcedure.input(inputSchema).mutation(async ({ input }) => {
  const {
    imei,
    manageUnitId,
    aliasName,
    stationCode,
    simNumber,
    batteryStatusInterval,
    deviceStatusInterval,
    usingChannel,
    time = Date.now(),
  } = input
  let device = await databaseService.createDevice({
    imei,
    manageUnitId,
    aliasName,
    stationCode,
    simNumber,
  })

  if (device) {
    await Promise.all([
      databaseService.createDeviceInterval({
        imei,
        batteryStatusInterval,
        deviceStatusInterval,
        time: time ?? Date.now(),
      }),
      databaseService.createSetupChannel({
        imei,
        usingChannel,
        time: time ?? Date.now(),
      }),
    ])
  }
})
