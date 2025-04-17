import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyReply } from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import createContext from "./context"
import { PORT } from "./envConfigs"
import initSwagger from "./swagger"
import { appRouter, AppRouter } from "./router/appRouter"
import { appService } from "./services/app"

const fastify = Fastify({
  maxParamLength: 5000,
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
    file: "./application.log",
  },
})

const corsOptions = {
  credentials: true,
  origin: "*",
}

const start = async () => {
  try {
    await initSwagger(fastify)
    await fastify.register(fastifyCors, corsOptions)
    await fastify.register(fastifyCookie)

    fastify.get("/", async (_, reply: FastifyReply) => {
      return reply.send({ message: "Battery MQTT API" })
    })

    await fastify.register(fastifyTRPCPlugin, {
      prefix: "/",
      trpcOptions: {
        router: appRouter,
        createContext,
      } as FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
    })

    await fastify.listen({
      port: Number(PORT) || 4000,
    })
    await fastify.ready()
    fastify.swagger()
    appService.init()
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
