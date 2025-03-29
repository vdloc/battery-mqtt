import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"

import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import jwt from "jsonwebtoken"

import createContext from "./context"
import { CLIENT_URL } from "./envConfigs"
import { brokerApi } from "./api/brokerApi"
import { cronjob } from "./cron"
import initSwagger from "./swagger"

import { appRouter, AppRouter } from "./appRouter"

export interface UserIDJwtPayload extends jwt.JwtPayload {
  id: string
  exp: number
  iat: number
}

const fastify = Fastify({
  maxParamLength: 5000,
  logger: false,
})

const start = async () => {
  try {
    await initSwagger(fastify)
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
        allowMethodOverride: true,
      } as FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
    })

    const port = Number(process.env.PORT) || 2022
    await fastify.listen({
      port,
    })
    console.log("Server is running on port " + port)

    await fastify.ready()

    fastify.swagger()
    brokerApi.init()
    cronjob.init(brokerApi)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
