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
import attendanceRouter from './payroll/payroll.routes'
import salaryRouter from './payroll/salary.routes'
import payslipRouter from './payroll/payslip.routes'


const router = Router()


// router.use('/v1/version', versionRouter)
router.use('/v1/auth', authController)
// router.use('/v1/employees', AuthorizationCheck, PermissionCheck, employeeRouter)
// router.use('/v1/marital-status', AuthorizationCheck, PermissionCheck, maritalStatusController)
// router.use('/v1/departments', AuthorizationCheck, PermissionCheck, departmentController)
// router.use('/v1/positions', AuthorizationCheck, PermissionCheck, positionController)
// router.use('/v1/contract-types', AuthorizationCheck, PermissionCheck, contractTypeController)
// router.use('/v1/statuses', AuthorizationCheck, PermissionCheck, statusController)
// router.use('/v1/image', imageRouter)
// router.use('/v1/dashboards', AuthorizationCheck, PermissionCheck, dashboardRouter)
router.use('/v1/attendance', AuthorizationCheck, PermissionCheck, attendanceRouter)
router.use('/v1/salaries',  salaryRouter)
router.use('/v1/payslips', AuthorizationCheck, PermissionCheck, payslipRouter)

export default router
