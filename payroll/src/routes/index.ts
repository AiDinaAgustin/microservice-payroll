import Router from 'express'
import employeeRouter from './employee'
import versionRouter from './version'
import authController from './auth'
import maritalStatusController from './marital-status/maritalStatus'
import departmentController from './department/department'
import positionController from './position/position'
import contractTypeController from './contract-type/contractType'
import imageRouter from './image/image'
import statusController from './status/statusRoutes'
import AuthorizationCheck from '@middlewares/Auth'
import dashboardRouter from './dashboard/dashboard'
import PermissionCheck from '@middlewares/permissionCheck'
import attendanceRouter from './payroll/attendance.routes'
import salaryRouter from './payroll/salary.routes'
import payslipRouter from './payroll/payslip.routes'
import attendanceDeductionRouter from './payroll/attendanceDeduction.routes'


const router = Router()


router.use('/v1/auth', authController)
router.use('/v1/attendances', AuthorizationCheck, PermissionCheck, attendanceRouter)
router.use('/v1/attendance-deductions', AuthorizationCheck, PermissionCheck, attendanceDeductionRouter)
router.use('/v1/salaries', AuthorizationCheck, PermissionCheck, salaryRouter)
router.use('/v1/payslips', AuthorizationCheck, PermissionCheck, payslipRouter)

export default router
