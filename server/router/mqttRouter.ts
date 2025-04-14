import { router } from "../trpc"
import requestRoute from "./mqtt/request"
import getDevicesRoute from "./mqtt/getDevices"
import getIntervalsRoute from "./mqtt/getIntervals"
import getDeviceSetupChannelsRoute from "./mqtt/getDeviceSetupChannels"
import getDeviceStatusRoute from "./mqtt/getDeviceStatus"
import updateDeviceRoute from "./mqtt/updateDevice"

const mqttRouter = router({
  request: requestRoute,
  getDevices: getDevicesRoute,
  getDeviceStatus: getDeviceStatusRoute,
  getIntervals: getIntervalsRoute,
  getDeviceSetupChannels: getDeviceSetupChannelsRoute,
  updateDevice: updateDeviceRoute,
})

export default mqttRouter
