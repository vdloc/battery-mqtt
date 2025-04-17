import z from "zod"
import { publicProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  imei: z.string(),
})

export default publicProcedure.input(inputSchema).mutation(async ({ input }) => {
  const { imei } = input
  await Promise.all([
    databaseService.deleteDevice(imei),
    databaseService.deleteDeviceInterval(imei),
    databaseService.deleteSetupChannel(imei),
  ])
})
