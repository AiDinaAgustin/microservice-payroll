import { Router } from 'express'
import { 
  calculateDeductionController, 
  findAllDeductionsController, 
  findDeductionByIdController,
  deleteDeductionController
} from '@controllers/payroll/attendanceDeduction.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { CalculateDeductionSchema } from '@validators/payroll/attendanceDeduction'

const router = Router()

router.post('/calculate', validateRequestHandler(CalculateDeductionSchema), calculateDeductionController)
router.get('/list', findAllDeductionsController)
router.get('/:id', findDeductionByIdController)
router.delete('/delete/:id', deleteDeductionController)

export default router