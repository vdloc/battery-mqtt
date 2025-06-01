import z from "zod"
import { protectedProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  imei: z.string(),
  manageUnitId: z.string().optional(),
  aliasName: z.string().optional(),
  stationCode: z.string().optional(),
  simNumber: z.string().optional(),
  enableNotification: z.boolean().optional(),
})

export default protectedProcedure.input(inputSchema).mutation(async ({ ctx, input }) => {
  await databaseService.updateDevice(input)
})
