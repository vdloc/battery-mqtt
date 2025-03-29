import authRouter from "./router/authRouter"
import userRouter from "./router/userRouter"
import userDeviceRouter from "./router/userDeviceRouter"
import healthRouter from "./router/healthRouter"

import t from "./trpc"
import brokerRouter from "./router/brokerRouter"

export const mergeRouters = t.mergeRouters

export const appRouter = mergeRouters(authRouter, userRouter, userDeviceRouter, healthRouter, brokerRouter)
export type AppRouter = typeof appRouter
