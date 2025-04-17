import { protectedProcedure } from "../../trpc"

export default protectedProcedure.query(async ({ ctx }) => {
  const db = ctx.db
  return await db.query.brokerDeviceTable.findMany({
    limit: 100,
  })
})
