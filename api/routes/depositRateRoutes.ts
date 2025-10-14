import { Router } from 'express'
import {
  getDepositRates,
  createDepositRate,
  updateDepositRate,
  deleteDepositRate,
} from '../controllers/depositRateController'

const router = Router()

// GET /api/depositsR - ดึงรายการฝากเงิน
// GET /api/depositsR?id=xxx - ดึงรายการเดียว
router.get('/', getDepositRates)

// POST /api/depositsR - สร้างคำขอฝากเงิน
router.post('/', createDepositRate)

// PUT /api/depositsR/approve - อนุมัติคำขอฝากเงิน
router.put('/approve', updateDepositRate)

// PUT /api/depositsR/reject - ปฏิเสธคำขอฝากเงิน
router.put('/reject', deleteDepositRate)

export default router
