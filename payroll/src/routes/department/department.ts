import { Router } from 'express'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { DepartmentOptionFindSchema } from '@validators/findOption'
import { DepartmentFindSchema } from '@validators/department/find'
import { DepartmentCreateSchema } from '@validators/department/create'
import { DepartmentFindAllOptionController, DepartmentFindAllController, DepartmentCreateController, DepartmentUpdateController, DepartmentDeleteController, DepartmentFindByIdController, DepartmentPatchStatusController } from '@controllers/v1/department/department'
import { PositionPatchStatusSchema } from '@validators/position/patchPositionStatus'
import { DepartmentUpdateSchema } from '@validators/department/edit'

const router = Router()

router.get('/list', validateRequestHandler(DepartmentFindSchema), DepartmentFindAllController)
router.post('/add', validateRequestHandler(DepartmentCreateSchema), DepartmentCreateController)
router.get('/options', validateRequestHandler(DepartmentOptionFindSchema), DepartmentFindAllOptionController)
router.put('/edit/:id', validateRequestHandler(DepartmentUpdateSchema), DepartmentUpdateController)
router.delete('/delete/:id', DepartmentDeleteController)
router.get('/detail/:id', DepartmentFindByIdController)

export default router