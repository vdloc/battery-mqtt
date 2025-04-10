import { publicProcedure } from "../../trpc"

export default publicProcedure.query(async ({ ctx }) => {
  const db = ctx.db
  return await db.query.brokerDeviceTable.findMany({
    limit: 100,
  })
})
