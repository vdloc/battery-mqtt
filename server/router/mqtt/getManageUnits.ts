import { databaseService } from "../../services/database"
import { publicProcedure } from "../../trpc"

export default publicProcedure.query(async ({ ctx }) => {
  // const db = ctx.db
  return await databaseService.getManageUnits()
})
