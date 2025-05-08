import { databaseService } from "../../services/database"
import { protectedProcedure } from "../../trpc"

export default protectedProcedure.query(async ({ ctx }) => {
  // const db = ctx.db
  return await databaseService.getManageUnits()
})
