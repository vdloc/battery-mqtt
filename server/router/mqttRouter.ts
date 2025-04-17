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
import createDevice from "./mqtt/createDevice"
import deleteDevice from "./mqtt/deleteDevice"

const deviceRoutes = {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
}

const manageUnitRoutes = {
  getManageUnits,
  createManageUnit,
  updateManageUnit,
  deleteManageUnit,
}

const mqttRouter = router({
  request,
  getDeviceStatus,
  getIntervals,
  getDeviceSetupChannels,
  ...deviceRoutes,
  ...manageUnitRoutes,
})

export default mqttRouter
