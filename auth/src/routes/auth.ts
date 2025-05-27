import { Router } from 'express';
import { LoginSchema } from '@validators/login';
import validateRequestHandler from '../middlewares/validateRequestHandler';
import { LoginController } from '@controllers/auth';

const router = Router();

router.post('/login', validateRequestHandler(LoginSchema), LoginController);
export default router;
