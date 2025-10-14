import { Router } from 'express'
import {
  getDeposits,
  createDeposit,
  approveDeposit,
  rejectDeposit,
} from '../controllers/depositController'

const router = Router()

// GET /api/deposits - ดึงรายการฝากเงิน
// GET /api/deposits?id=xxx - ดึงรายการเดียว
router.get('/', getDeposits)

// POST /api/deposits - สร้างคำขอฝากเงิน
router.post('/', createDeposit)

// PUT /api/deposits/approve - อนุมัติคำขอฝากเงิน
router.put('/approve', approveDeposit)

// PUT /api/deposits/reject - ปฏิเสธคำขอฝากเงิน
router.put('/reject', rejectDeposit)

export default router
