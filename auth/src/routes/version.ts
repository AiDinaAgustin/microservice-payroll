import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'

const router = Router()

router.get('', (req, res) => {
   res.status(StatusCodes.OK).json({ version: '1.0.0' })
})

export default router
