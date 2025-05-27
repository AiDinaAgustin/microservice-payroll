import { Router } from 'express'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { PositionOptionFindSchema } from '@validators/findOption'
import { PositionFindAllOptionController, updatePositionController, PositionFindByIdController, DeletePositionController } from '@controllers/v1/position/position'
import { PositionFindSchema } from '@validators/position/find'
import { PositionCreateSchema } from '@validators/position/create'
import { findAllPositionController } from '@controllers/v1/position/position'
import { createPositionController } from '@controllers/v1/position/position'
import { PositionPatchStatusSchema } from '@validators/position/patchPositionStatus'
import { patchPositionStatusController } from '@controllers/v1/position/position'
import { PositionUpdateSchema } from '@validators/position/edit'
const router = Router()

router.get('/list', validateRequestHandler(PositionFindSchema), findAllPositionController)
router.post('/add', validateRequestHandler(PositionCreateSchema), createPositionController)
router.put('/edit/:id', validateRequestHandler(PositionUpdateSchema), updatePositionController)
router.patch('/patch/:id/status', validateRequestHandler(PositionPatchStatusSchema), patchPositionStatusController) 
router.get('/options', validateRequestHandler(PositionOptionFindSchema), PositionFindAllOptionController)
router.get('/detail/:id', PositionFindByIdController)
router.delete('/delete/:id', DeletePositionController)

export default router
