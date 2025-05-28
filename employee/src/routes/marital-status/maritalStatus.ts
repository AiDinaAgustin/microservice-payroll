import { Router } from 'express'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { MaritalStatusFindAllOptionController } from '@controllers/v1/marital-status/maritalStatus'
import { MaritalStatusOptionFindSchema } from '@validators/findOption'

const router = Router()

router.get('/options', validateRequestHandler(MaritalStatusOptionFindSchema), MaritalStatusFindAllOptionController)

export default router
