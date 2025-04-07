import { initTRPC, TRPCError } from "@trpc/server"
import { OperationMeta } from "openapi-trpc"
import createContext from "./context"
const t = initTRPC.meta<OperationMeta>().context<Context>().create()
export default t

type Context = Awaited<ReturnType<typeof createContext>>

export const publicProcedure = t.procedure
export const router = t.router

export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return opts.next({ ctx: {} })
})
