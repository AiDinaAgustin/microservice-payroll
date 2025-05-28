import { Router } from 'express'
import { DashboardFindAllByContractEndSoonController, DashboardFindInsightController, WhatsOnTodayController } from '@controllers/v1/dashboard/dashboard'
import validateRequestHandler from '@middlewares/validateRequestHandler'
import { DashboardContractEndSoonSchema, DashboardInsightSchema, DashboardWhatsOnTodaySchema } from '@validators/dashboard'

const router = Router()

router.get('/insight', validateRequestHandler(DashboardInsightSchema), DashboardFindInsightController)
router.get('/contract-end', validateRequestHandler(DashboardContractEndSoonSchema),  DashboardFindAllByContractEndSoonController);
router.get('/whatsontoday',validateRequestHandler(DashboardWhatsOnTodaySchema), WhatsOnTodayController);

export default router
