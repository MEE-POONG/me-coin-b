import { Router } from 'express'
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  purchaseItem,
} from '../controllers/itemController'

const router = Router()

router.get('/', getItems)
router.post('/', createItem)
router.put('/', updateItem)
router.delete('/', deleteItem)
router.post('/purchase', purchaseItem)

export default router
