import { generateOpenAPIDocumentFromTRPCRouter } from "openapi-trpc"
import brokerRouter from "./router/mqttRouter"
import { appRouter } from "./router/appRouter"

export const doc = generateOpenAPIDocumentFromTRPCRouter(appRouter, {
  pathPrefix: "/",
})
