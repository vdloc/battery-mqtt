import z from "zod"
import { protectedProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  id: z.string(),
})

export default protectedProcedure.input(inputSchema).mutation(async ({ ctx, input }) => {
  await databaseService.deleteManageUnit(input)
  return input
})
