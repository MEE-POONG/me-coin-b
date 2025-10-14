import { Router } from 'express'
import {
  getUsers,
  updateUser,
  getUserTransactions,
} from '../controllers/userController'

const router = Router()

// GET /api/users - ดึงรายการ User
// GET /api/users?id=xxx - ดึง User เดียว
router.get('/', getUsers)

// PUT /api/users - อัพเดทข้อมูล User
router.put('/', updateUser)

// GET /api/users/:id/transactions - ดึง Transaction history
router.get('/:id/transactions', getUserTransactions)

export default router
