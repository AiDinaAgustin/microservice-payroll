import { Router } from 'express'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { ContractTypeOptionFindSchema } from '@validators/findOption'
import { ContractTypeFindAllOptionController, ContractTypePatchStatusController } from '@controllers/v1/contract-type/contractType'
import { ContractTypeFindSchema } from '@validators/contract-type/find'
import { ContractTypeCreateSchema } from '@validators/contract-type/create'
import { 
    ContractTypeFindAllController, 
    ContractTypeCreateController, 
    ContractTypeUpdateController, 
    ContractTypeDeleteController 
} from '@controllers/v1/contract-type/contractType'
import { PositionPatchStatusSchema } from '@validators/position/patchPositionStatus'


const router = Router()

router.get('/options', validateRequestHandler(ContractTypeOptionFindSchema), ContractTypeFindAllOptionController)
router.get('/list', validateRequestHandler(ContractTypeFindSchema), ContractTypeFindAllController)
router.post('/add', validateRequestHandler(ContractTypeCreateSchema), ContractTypeCreateController)
router.put('/edit/:id', validateRequestHandler(ContractTypeCreateSchema), ContractTypeUpdateController)
router.delete('/delete/:id', ContractTypeDeleteController)


export default router