import z from "zod"
import { publicProcedure } from "../../trpc"
import { databaseService } from "../../services/database"

const inputSchema = z.object({
  name: z.string(),
})

export default publicProcedure.input(inputSchema).query(async ({ ctx, input }) => {
  await databaseService.updateManageUnit(input)
  return input
})
