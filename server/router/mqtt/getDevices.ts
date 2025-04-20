import { databaseService } from "../../services/database"
import { protectedProcedure } from "../../trpc"

export default protectedProcedure.query(async ({ ctx }) => {
  return await databaseService.getDevices()
})
