import { router } from "../trpc"
import getNotificationSetting from "./notification/getNotificationSetting"
import updateNotificationSetting from "./notification/updateNotificationSetting"

const notificationRouter = router({
  getNotificationSetting,
  updateNotificationSetting,
})

export default notificationRouter
