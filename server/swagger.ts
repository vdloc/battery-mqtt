import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { FastifyInstance } from "fastify"
import { doc } from "./openapi"
import { OpenAPIV2, OpenAPIV3 } from "openapi-types"

interface FastifySwaggerOptions {
  mode?: "static"
  specification: {
    document: OpenAPIV2.Document | OpenAPIV3.Document
  }
}

const swaggerOptions: FastifySwaggerOptions & { mode: "static" } = {
  mode: "static",
  specification: {
    document: doc,
  },
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
