import { Router } from 'express';
import { getStatuses } from '@controllers/v1/status/statusController';

const router = Router();

router.get('', getStatuses);

export default router;