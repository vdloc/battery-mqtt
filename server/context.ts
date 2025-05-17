import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import jwt from "jsonwebtoken"
import { drizzleOrm_NodePostgres } from "@fsb/drizzle"
import { drizzleOrm } from "@fsb/drizzle"
import { schema } from "@fsb/drizzle"
import { cookieNameAuth, cookieNameDeviceIds } from "./configTer"
import manageDevice from "./helper/manageDevice"
import { JWT_SECRET, DATABASE_URL } from "./envConfigs"

const { eq } = drizzleOrm
const { drizzle } = drizzleOrm_NodePostgres
const secretJwt = JWT_SECRET
const databaseUrl = DATABASE_URL
const { userTable } = schema

/**
 * Định nghĩa giao diện cho payload của JWT có chứa ID người dùng.
 * @interface
 * @extends {jwt.JwtPayload}
 */
export interface UserIDJwtPayload extends jwt.JwtPayload {
  id: string
  exp: number
  iat: number
}

/**
 * Tạo ngữ cảnh cho ứng dụng Fastify sử dụng với tRPC.
 * @param {CreateFastifyContextOptions} options - Các tùy chọn để tạo ngữ cảnh, bao gồm yêu cầu và phản hồi.
 * @returns {Promise<Object>} Trả về một đối tượng ngữ cảnh bao gồm thông tin người dùng, cấu hình database và thiết bị.
 */
const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
  // Kiểm tra xem biến môi trường cho JWT và URL cơ sở dữ liệu có được định nghĩa không.
  if (!secretJwt) throw new Error("JWT_SECRET is not defined")
  if (!databaseUrl) throw new Error("DATABASE_URL is not defined")

  const config = { secretJwt, databaseUrl }
  const cookies = req.cookies
  const authToken = cookies[cookieNameAuth]
  const db = drizzle(databaseUrl, { schema })

  // Nếu có token xác thực trong cookie
  if (authToken) {
    try {
      // Giải mã token JWT để lấy thông tin người dùng
      let decoded = jwt.verify(authToken, secretJwt) as UserIDJwtPayload

      // Nếu giải mã thành công và có thông tin người dùng
      if (decoded) {
        // Tìm kiếm người dùng trong cơ sở dữ liệu dựa trên ID từ token
        const user = await db.query.userTable.findFirst({ where: eq(userTable.id, decoded.id) })
        if (!user) throw new Error("User not found")

        // Lấy thông tin thiết bị từ cookie
        const deviceIdsFromCookieString = cookies[cookieNameDeviceIds]
        if (!deviceIdsFromCookieString) {
          throw new Error("Device cookie not found")
        }

        // Kiểm tra thiết bị dựa trên thông tin từ cookie
        const device = await manageDevice.getDeviceFromCookieString(db, user.id, deviceIdsFromCookieString)
        if (!device) throw new Error("Device not found")

        // Trả về đối tượng ngữ cảnh bao gồm yêu cầu, phản hồi, thông tin người dùng, cơ sở dữ liệu, cấu hình, thông tin đã giải mã, và thiết bị
        return { req, res, user, db, config, decoded, device }
      }
    } catch (error) {
      // Nếu có lỗi trong quá trình giải mã hoặc tìm kiếm, xóa cookie xác thực
      res.clearCookie(cookieNameAuth)
    }
  }

  // Trả về đối tượng ngữ cảnh chỉ với yêu cầu, phản hồi, cơ sở dữ liệu và cấu hình nếu không có thông tin người dùng
  return { req, res, db, config }
}

export default createContext
