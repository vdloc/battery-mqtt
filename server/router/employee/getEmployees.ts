import z from "zod"
import { databaseService } from "../../services/database"
import { protectedProcedure } from "../../trpc"

const inputSchema = z.object({
  manageUnitId: z.string(),
})

export default protectedProcedure.input(inputSchema).query(async ({ input }) => {
  return await databaseService.getEmployees(input.manageUnitId)
})
