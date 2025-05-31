import { Router } from 'express'
import { 
  createPayslipController, 
  findAllPayslipController, 
  findPayslipByIdController 
} from '@controllers/payroll/payslip.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { PayslipSchema } from '@validators/payroll/payslip'

const router = Router()

router.post('/add', validateRequestHandler(PayslipSchema), createPayslipController)
router.get('/list', findAllPayslipController)
router.get('/detail/:id', findPayslipByIdController)

export default router