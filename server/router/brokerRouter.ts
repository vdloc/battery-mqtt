import { protectedProcedure, publicProcedure, router } from "../trpc"
import { z } from "zod"
import { schema } from "@fsb/drizzle"
import { drizzleOrm } from "@fsb/drizzle"
const { count, desc, eq } = drizzleOrm

const inputSchema = z.object({
  imei: z.string(),
})
const { deviceIntervalTable } = schema
const brokerRouter = router({
  requestInterval: publicProcedure.input(inputSchema).query(async ({ ctx }) => {
    const { req } = ctx
    const imei = JSON.parse(req.query.input)[0].imei
    const db = ctx.db
    const interval = await db.query.deviceIntervalTable.findFirst({
      where: eq(deviceIntervalTable.imei, imei),
    })

    return true
  }),
})

export default brokerRouter
