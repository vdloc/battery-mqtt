import { generateOpenAPIDocumentFromTRPCRouter } from "openapi-trpc"
import brokerRouter from "./router/mqttRouter"

export const doc = generateOpenAPIDocumentFromTRPCRouter(brokerRouter, {
  pathPrefix: "/",
})
