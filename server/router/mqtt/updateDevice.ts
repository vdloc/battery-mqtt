import z from "zod"
import { publicProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  imei: z.string(),
  manageUnitId: z.string().optional(),
  aliasName: z.string().optional(),
  stationCode: z.string().optional(),
  simNumber: z.string().optional(),
})

export default publicProcedure.input(inputSchema).mutation(async ({ ctx, input }) => {
  await databaseService.updateDevice(input)
})
