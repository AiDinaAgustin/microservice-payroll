import { Router } from 'express';
import {
  EmployeeCreateSchema,
  EmployeeDeleteSchema,
  EmployeeFindByIdSchema,
  EmployeeFindSchema,
  EmployeeUpdateSchema
} from '@validators/employee';
import {
   EmployeeCreateController,
   EmployeeDeleteController,
   EmployeeFindAllController,
   EmployeeFindAllOptionController,
   EmployeeFindByIdController,
   EmployeeUpdateController,
   updateEmployeeStatusController
} from '@controllers/employee'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { baseFindOptionSchema } from '@validators/baseFind'
import uploadFile from "@middlewares/upload";
import {
   upload,
   download
} from "@controllers/importExcel";

const router = Router();

router.post("/upload", uploadFile.single("file"), upload);
router.get("/download", download);
router.get('/list', validateRequestHandler(EmployeeFindSchema), EmployeeFindAllController);
router.get('/options', validateRequestHandler(baseFindOptionSchema), EmployeeFindAllOptionController);
router.get('/detail/:id', validateRequestHandler(EmployeeFindByIdSchema), EmployeeFindByIdController);
router.patch('/patch/:id', updateEmployeeStatusController);
router.post('/add', validateRequestHandler(EmployeeCreateSchema), EmployeeCreateController);
router.put('/edit/:id', validateRequestHandler(EmployeeUpdateSchema), EmployeeUpdateController);
router.delete('/delete/:id', validateRequestHandler(EmployeeDeleteSchema), EmployeeDeleteController);

export default router;