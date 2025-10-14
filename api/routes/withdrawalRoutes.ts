import { Router } from 'express'
import {
  getWithdrawals,
  createWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
} from '../controllers/withdrawalController'

const router = Router()

router.get('/', getWithdrawals)
router.post('/', createWithdrawal)
router.put('/approve', approveWithdrawal)
router.put('/reject', rejectWithdrawal)

export default router
