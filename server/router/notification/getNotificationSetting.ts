import { databaseService } from "../../services/database"
import { protectedProcedure } from "../../trpc"

export default protectedProcedure.query(async () => {
  return await databaseService.getNotificationSetting()
})
