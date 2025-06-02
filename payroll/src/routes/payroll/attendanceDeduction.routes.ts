import { Router } from 'express'
import { 
  calculateDeductionController, 
  findAllDeductionsController, 
  findDeductionByIdController,
  deleteDeductionController,
  generateDeductionsController
} from '@controllers/payroll/attendanceDeduction.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { CalculateDeductionSchema, GenerateDeductionsSchema } from '@validators/payroll/attendanceDeduction'

const router = Router()

router.post('/calculate', validateRequestHandler(CalculateDeductionSchema), calculateDeductionController)
router.get('/list', findAllDeductionsController)
router.get('/detail/:id', findDeductionByIdController)
router.delete('/delete/:id', deleteDeductionController)
router.post('/generate', validateRequestHandler(GenerateDeductionsSchema), generateDeductionsController)

export default router