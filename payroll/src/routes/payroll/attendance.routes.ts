import { Router } from 'express'
import { 
  createAttendanceController, 
  findAllAttendanceController, 
  findAttendanceByIdController,
  updateAttendanceController,
  deleteAttendanceController
} from '@controllers/payroll/attendance.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { AttendanceSchema } from '@validators/payroll/attendance'

const router = Router()

// Use the specified endpoint structure
router.post('/add', validateRequestHandler(AttendanceSchema), createAttendanceController)
router.get('/list', findAllAttendanceController)
router.get('/:id', findAttendanceByIdController)
router.put('/edit/:id', validateRequestHandler(AttendanceSchema), updateAttendanceController)
router.delete('/delete/:id', deleteAttendanceController)

export default router