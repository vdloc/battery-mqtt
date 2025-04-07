import authRouter from "./authRouter"
import userRouter from "./userRouter"
import userDeviceRouter from "./userDeviceRouter"
import healthRouter from "./healthRouter"
import brokerRouter from "./brokerRouter"
import t from "../trpc"

export const mergeRouters = t.mergeRouters
export const appRouter = mergeRouters(authRouter, userRouter, userDeviceRouter, healthRouter, brokerRouter)
export type AppRouter = typeof appRouter
