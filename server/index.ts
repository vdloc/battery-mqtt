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
import { brokerApi } from "./api/brokerApi"
import { cronjob } from "./cron"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"

const swaggerOptions = {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Test swagger",
      description: "Testing the Fastify swagger API",
      version: "0.1.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    tags: [
      { name: "user", description: "User related end-points" },
      { name: "code", description: "Code related end-points" },
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: "apiKey",
          name: "apiKey",
          in: "header",
        },
      },
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
  },
}

const swaggerUiOptions = {
  routePrefix: "/docs",
  exposeRoute: true,
}

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

const start = async () => {
  try {
    await fastify.register(fastifySwagger, swaggerOptions)
    await fastify.register(fastifySwaggerUi, swaggerUiOptions)
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
