import { router } from "../trpc"
import createEmployee from "./employee/createEmployee"
import deleteEmployee from "./employee/deleteEmployee"
import getEmployees from "./employee/getEmployees"
import updateEmployee from "./employee/updateEmployee"

const employeeRouter = router({
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
})

export default employeeRouter
