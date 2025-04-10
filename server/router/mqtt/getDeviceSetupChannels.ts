import { drizzleOrm } from "@fsb/drizzle"
import { publicProcedure } from "../../trpc"
import { schema } from "@fsb/drizzle"

const { desc } = drizzleOrm
const { deviceIntervalTable } = schema

export default publicProcedure.query(async ({ ctx, input }) => {
  const db = ctx.db

  return await db.query.setupChannelTable.findMany({
    orderBy: [desc(deviceIntervalTable.time)],
    limit: 100,
  })
})
