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
import dashboardRouter from './dashboard/dashboard'
import attendanceRouter from './payroll/attendance.routes'
import salaryRouter from './payroll/salary.routes'
import payslipRouter from './payroll/payslip.routes'
import attendanceDeductionRouter from './payroll/attendanceDeduction.routes'
// Opsi 1
import AuthorizationCheck from '../middlewares/Auth'
import PermissionCheck from '../middlewares/permissionCheck'
// // Opsi 2
// // @ts-ignore
// import AuthorizationCheck from '../../../gateway/middlewares/authCheck.js'
// // @ts-ignore
// import PermissionCheck from '../../../gateway/middlewares/permissionCheck.js'


const router = Router()


router.use('/v1/auth', authController)
router.use('/v1/attendances', AuthorizationCheck, PermissionCheck, attendanceRouter)
router.use('/v1/employees', AuthorizationCheck, PermissionCheck, employeeRouter)
router.use('/v1/attendance-deductions', AuthorizationCheck, PermissionCheck, attendanceDeductionRouter)
router.use('/v1/salaries', AuthorizationCheck, PermissionCheck, salaryRouter)
router.use('/v1/payslips', AuthorizationCheck, PermissionCheck, payslipRouter)

export default router
