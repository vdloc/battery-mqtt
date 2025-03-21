import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import jwt from "jsonwebtoken"
import authRouter from "./router/authRouter"
import userRouter from "./router/userRouter"
import deviceRouter from "./router/deviceRouter"
import healthRouter from "./router/healthRouter"
import t from "./trpc"
import createContext from "./context"
import { CLIENT_URL } from "./envConfigs"
import { BrokerAPI } from "./api/brokerApi"

export interface UserIDJwtPayload extends jwt.JwtPayload {
  id: string
  exp: number
  iat: number
}

export const mergeRouters = t.mergeRouters

const appRouter = mergeRouters(authRouter, userRouter, deviceRouter, healthRouter)
export type AppRouter = typeof appRouter

const fastify = Fastify({
  maxParamLength: 5000,
  logger: false,
})
const brokerApi = new BrokerAPI()
brokerApi.init()

const start = async () => {
  try {
    await fastify.register(fastifyCors, {
      credentials: true,
      origin: CLIENT_URL,
    })

    await fastify.register(fastifyCookie)

    fastify.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: "Hello, TER!" })
    })

    await fastify.register(fastifyTRPCPlugin, {
      prefix: "/",
      trpcOptions: {
        router: appRouter,
        createContext,
      } as FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
    })

    const port = Number(process.env.PORT) || 2022
    await fastify.listen({
      port,
      host: "0.0.0.0",
    })
    console.log("Server is running on port " + port)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
