import z from "zod"
import { protectedProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  t1: z.number(),
  t2: z.number(),
  t3: z.number(),
  manageUnitId: z.string(),
})

export default protectedProcedure.input(inputSchema).mutation(async ({ input }) => {
  await databaseService.updateNotificationSetting(input)
  return input
})
