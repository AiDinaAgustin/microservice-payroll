import { Router } from 'express'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { UploadImageSchema } from '@validators/image'
import { EmployeeUploadImageController } from '@controllers/v1/image/uploadImage'
import { getImageController } from '@controllers/v1/image/getImage'
import AuthorizationCheck from '@middlewares/Auth'
import uploadImageFile from '@middlewares/uploadImage'
import PermissionCheck from '@middlewares/permissionCheck'

const router = Router()
router.post('/upload_profile', AuthorizationCheck, PermissionCheck, uploadImageFile.single("file"), EmployeeUploadImageController)
router.get('/:imageName', getImageController)

export default router