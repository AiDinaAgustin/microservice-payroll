import { Router } from 'express'
import { createSalaryController, findAllSalaryController, findSalaryByIdController } from '@controllers/payroll/salary.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { SalarySchema } from '@validators/payroll/salary'

const router = Router()

router.post('/', validateRequestHandler(SalarySchema), createSalaryController)
router.get('/list', findAllSalaryController)
router.get('/:id', findSalaryByIdController)

export default router