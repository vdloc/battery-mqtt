import { createTRPCReact } from "@trpc/react-query"
import { AppRouter } from "@fsb/server/router/appRouter"

export const trpc = createTRPCReact<AppRouter>()
