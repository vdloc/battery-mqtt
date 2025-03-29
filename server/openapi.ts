import { generateOpenAPIDocumentFromTRPCRouter } from "openapi-trpc"
import brokerRouter from "./router/brokerRouter"

export const doc = generateOpenAPIDocumentFromTRPCRouter(brokerRouter, {
  pathPrefix: "/",
})
