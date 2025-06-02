import { Router } from 'express'
import { 
  createPayslipController, 
  findAllPayslipController, 
  findPayslipByIdController,
  generatePayslipsController 
} from '@controllers/payroll/payslip.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { PayslipSchema, GeneratePayslipsSchema } from '@validators/payroll/payslip'

const router = Router()

router.post('/add', validateRequestHandler(PayslipSchema), createPayslipController)
router.get('/list', findAllPayslipController)
router.get('/detail/:id', findPayslipByIdController)
router.post('/generate', validateRequestHandler(GeneratePayslipsSchema), generatePayslipsController)

export default router