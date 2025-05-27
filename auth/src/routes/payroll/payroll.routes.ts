import { Router } from 'express'
import { createAttendanceController } from '@controllers/payroll/attendance.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { AttendanceSchema } from '@validators/payroll/attendance'

const router = Router()

router.post(
  '/attendance',
  validateRequestHandler(AttendanceSchema),
  createAttendanceController
)

export default router