import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { FastifyInstance } from "fastify"
import { doc } from "./openapi"

const swaggerOptions = {
  mode: "static", // Use 'static' mode to serve a static OpenAPI spec
  specification: {
    document: doc, // Use the generated OpenAPI document
  },
  exposeRoute: true, // Expose the Swagger UI
  routePrefix: "/documentation",
}

const swaggerUiOptions = {
  routePrefix: "/swagger",
  uiConfig: {
    // docExpansion: "full",
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecificationClone: true,
}

async function initSwagger(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, swaggerOptions)
  await fastify.register(fastifySwaggerUi, swaggerUiOptions)
}
export default initSwagger
