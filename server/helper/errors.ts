import { TRPCError } from "@trpc/server"

export class DeviceNotFoundError extends TRPCError {
  constructor(imei: string) {
    super({
      code: "NOT_FOUND",
      message: `Device with imei ${imei} not found`,
    })
  }
}

export class DeviceExistedError extends TRPCError {
  constructor(imei: string) {
    super({
      code: "CONFLICT",
      message: `Device with imei ${imei} existed`,
    })
  }
}

export class ManageUnitNotFoundError extends TRPCError {
  constructor(manageUnitId: string) {
    super({
      code: "NOT_FOUND",
      message: `Manage unit with id ${manageUnitId} not found`,
    })
  }
}
