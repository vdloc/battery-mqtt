import { drizzleOrm } from "@fsb/drizzle"
import { protectedProcedure } from "../../trpc"
import { schema } from "@fsb/drizzle"

const { desc } = drizzleOrm
const { deviceIntervalTable } = schema

export default protectedProcedure.query(async ({ ctx }) => {
  const db = ctx.db

  return await db.query.deviceIntervalTable.findMany({
    orderBy: [desc(deviceIntervalTable.time)],
    limit: 100,
  })
})
