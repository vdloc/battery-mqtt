import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import createContext from "./context"
import { CLIENT_API_URL, CLIENT_URL, PORT } from "./envConfigs"
import initSwagger from "./swagger"
import { appRouter, AppRouter } from "./router/appRouter"
import { appService } from "./services/app"

const fastify = Fastify({
  maxParamLength: 5000,
  logger: false,
})

const corsOptions = {
  credentials: true,
  origin: (origin: any, callback: Function) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    // Allow specific origin
    const allowedOrigins = [CLIENT_URL, CLIENT_API_URL]
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  preflightContinue: false,
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
        allowMethodOverride: true,
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
