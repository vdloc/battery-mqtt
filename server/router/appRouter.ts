import authRouter from "./authRouter"
import userRouter from "./userRouter"
import userDeviceRouter from "./userDeviceRouter"
import healthRouter from "./healthRouter"
import mqttRouter from "./mqttRouter"
import employeeRouter from "./employeeRouter"
import t from "../trpc"

export const mergeRouters = t.mergeRouters
export const appRouter = mergeRouters(
  authRouter,
  userRouter,
  userDeviceRouter,
  healthRouter,
  mqttRouter,
  employeeRouter
)
export type AppRouter = typeof appRouter
