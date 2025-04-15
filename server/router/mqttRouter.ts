import { router } from "../trpc"
import request from "./mqtt/request"
import getDevices from "./mqtt/getDevices"
import getIntervals from "./mqtt/getIntervals"
import getDeviceSetupChannels from "./mqtt/getDeviceSetupChannels"
import getDeviceStatus from "./mqtt/getDeviceStatus"
import updateDevice from "./mqtt/updateDevice"
import getManageUnits from "./mqtt/getManageUnits"
import updateManageUnit from "./mqtt/updateManageUnit"
import deleteManageUnit from "./mqtt/deleteManageUnit"
import createManageUnit from "./mqtt/createManageUnit"

const mqttRouter = router({
  request,
  getDevices,
  getDeviceStatus,
  getIntervals,
  getDeviceSetupChannels,
  getManageUnits,
  updateManageUnit,
  updateDevice,
  deleteManageUnit,
  createManageUnit,
})

export default mqttRouter
