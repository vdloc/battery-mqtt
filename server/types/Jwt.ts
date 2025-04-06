import type { JwtPayload } from "jsonwebtoken"
export interface UserIDJwtPayload extends JwtPayload {
  id: string
  exp: number
  iat: number
}
