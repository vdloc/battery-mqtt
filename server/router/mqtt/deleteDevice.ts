import z from "zod"
import { protectedProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  imei: z.string(),
})

export default protectedProcedure.input(inputSchema).mutation(async ({ input }) => {
  const { imei } = input
  try {
    await Promise.all([
      databaseService.deleteDeviceInterval(imei),
      databaseService.deleteSetupChannel(imei),
      databaseService.deleteGatewayStatusByImei(imei),
      databaseService.deleteBatteryStatusByImei(imei),
    ])
  } catch (error) {
    console.log(error)
  }
  await databaseService.deleteDevice(imei)
})
