import { Router } from 'express'
import { getGifts, sendItemGift } from '../controllers/giftController'

const router = Router()

// GET /api/gifts - ดึงรายการของขวัญ
router.get('/', getGifts)

// POST /api/gifts/send-item - ส่งไอเทมเป็นของขวัญ
router.post('/send-item', sendItemGift)

export default router
