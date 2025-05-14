import { protectedProcedure, router } from "../trpc"
import { z } from "zod"
import { schema, drizzleOrm } from "@fsb/drizzle"
import { databaseService } from "../services/database"
const { eq, count, asc, ilike, and } = drizzleOrm
const { userTable } = schema

const userRouter = router({
  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email("Invalid email").optional(),
        name: z.string().min(2, "Name must be at least 2 chars").max(50, "Name must be at max 50 chars").optional(),
      })
    )
    .mutation(async (opts) => {
      const db = opts.ctx.db
      const user = await db
        .update(userTable)
        .set({ name: opts.input.name, email: opts.input.email })
        .where(eq(userTable.id, opts.input.id))
        .returning()

      return user
    }),

  getUsers: protectedProcedure
    .input(
      z.object({
        page: z.number(),
        limit: z.number().optional(),
        search: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(async (opts) => {
      const page = opts.input.page
      const limit = opts.input.limit ?? 12
      const db = opts.ctx.db
      const users = await db.query.userTable.findMany({
        limit,
        offset: (page - 1) * limit,
        orderBy: [asc(userTable.name)],
        columns: { id: true, name: true, email: true, createdAt: true, lastLoginAt: true },
        where: and(
          opts.input.search ? ilike(userTable.name, `%${opts.input.search}%`) : undefined,
          opts.input.userId ? eq(userTable.id, opts.input.userId) : undefined
        ),
      })
      const totalData = await db
        .select({ count: count() })
        .from(userTable)
        .where(opts.input.search ? ilike(userTable.name, `%${opts.input.search}%`) : undefined)
      const total = totalData[0].count

      return { users, page, limit, total }
    }),
  getUserProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async (opts) => {
      const id = opts.input.id
      const db = opts.ctx.db
      const user = await db.query.userTable.findFirst({
        columns: { id: true, name: true, email: true, createdAt: true, lastLoginAt: true },
        where: eq(userTable.id, id),
      })

      if (!user) throw new Error("User not found")

      return user
    }),
  getUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async (opts) => {
      const id = opts.input.id
      const db = opts.ctx.db
      const user = await db.query.userTable.findFirst({
        columns: { id: true, name: true },
        where: eq(userTable.id, id),
      })
      const permission = await databaseService.getUserPermissions(id)

      if (!user) throw new Error("User not found")

      return { user, permission }
    }),
})
export default userRouter
