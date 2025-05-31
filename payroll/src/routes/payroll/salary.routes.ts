import { Router } from 'express'
import { 
  createSalaryController, 
  findAllSalaryController, 
  findSalaryByIdController,
  updateSalaryController,
  deleteSalaryController
} from '@controllers/payroll/salary.controller'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { SalarySchema } from '@validators/payroll/salary'

const router = Router()

// Use the new endpoint structure
router.post('/add', validateRequestHandler(SalarySchema), createSalaryController)
router.get('/list', findAllSalaryController)
router.get('/detail/:id', findSalaryByIdController)
router.put('/edit/:id', validateRequestHandler(SalarySchema), updateSalaryController)
router.delete('/delete/:id', deleteSalaryController)

export default router