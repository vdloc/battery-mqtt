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

export class UserNotFoundError extends TRPCError {
  constructor(userId?: string) {
    super({
      code: "NOT_FOUND",
      message: userId ? `User with id ${userId} not found` : `User not found`,
    })
  }
}

export class EmployeeNotFoundError extends TRPCError {
  constructor(employeeID?: string) {
    super({
      code: "NOT_FOUND",
      message: employeeID ? `Employee with id ${employeeID} not found` : `Employee not found`,
    })
  }
}
