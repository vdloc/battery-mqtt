import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { FastifyInstance } from "fastify"

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
      // securitySchemes: {
      //   apiKey: {
      //     type: "apiKey", // Ensure this is a string literal, not a generic string
      //     name: "apiKey",
      //     in: "header",
      //   },
      // },
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

async function initSwagger(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, swaggerOptions)
  await fastify.register(fastifySwaggerUi, swaggerUiOptions)
}
export default initSwagger
