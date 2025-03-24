import { protectedProcedure, router } from "../trpc"
import { z } from "zod"
import { brokerDeviceTable, deviceIntervalTable, setupChannelTable } from "@fsb/drizzle"
import { drizzleOrm } from "@fsb/drizzle"
const { count, desc, eq } = drizzleOrm

const deviceRouter = router({
  deleteDevice: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const db = opts.ctx.db
      await db.delete(brokerDeviceTable).where(eq(brokerDeviceTable.id, opts.input.deviceId))

      return true
    }),

  getDevices: protectedProcedure
    .input(
      z.object({
        page: z.number(),
        search: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(async (opts) => {
      const page = opts.input.page
      const limit = 12
      const db = opts.ctx.db
      const devices = await db.query.deviceTable.findMany({
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(brokerDeviceTable)],
        columns: { id: true, createdAt: true, lastLoginAt: true, userAgent: true, ip: true },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },

        where: opts.input.userId ? eq(brokerDeviceTable, opts.input.userId) : undefined,
      })

      const totalData = await db.select({ count: count() }).from(brokerDeviceTable)
      const total = totalData[0].count

      return { devices, page, limit, total }
    }),
})

export default deviceRouter
