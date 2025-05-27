import t from "../trpc"
import authRouter from "./authRouter"
import userRouter from "./userRouter"
import userDeviceRouter from "./userDeviceRouter"
import healthRouter from "./healthRouter"
import mqttRouter from "./mqttRouter"
import employeeRouter from "./employeeRouter"
import notificationRouter from "./notificationRouter"

export const mergeRouters = t.mergeRouters
export const appRouter = mergeRouters(
  authRouter,
  userRouter,
  userDeviceRouter,
  healthRouter,
  mqttRouter,
  employeeRouter,
  notificationRouter
)
export type AppRouter = typeof appRouter
