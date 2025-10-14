import { Router } from 'express'
import { getTransfers, createTransfer } from '../controllers/transferController'

const router = Router()

router.get('/', getTransfers)
router.post('/', createTransfer)

export default router
