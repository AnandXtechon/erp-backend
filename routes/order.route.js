import express from 'express'
import {
  getAllPurchaseOrdersController,
  getPurchaseOrderByIdController,
  createPurchaseOrderController,
  updatePurchaseOrderController,
  deletePurchaseOrderController,
  getLineItemsByPOController,
  getLineItemByIdController,
  deleteLineItemController,
  getPurchaseOrderByVendorIdController,
  getLastOrderDateController,
} from '../controllers/order.controller.js'

const router = express.Router()

// Purchase Orders
router.get('/', getAllPurchaseOrdersController)
router.get('/:id', getPurchaseOrderByIdController)
router.get('/po/:vendor_id', getPurchaseOrderByVendorIdController)
router.get('/po/last-order/:vendor_id', getLastOrderDateController)
router.post('/create-order', createPurchaseOrderController)
router.put('/update-order/:id', updatePurchaseOrderController)
router.delete('/delete-order/:id', deletePurchaseOrderController)


// Line Items
router.get('/:po_id/line-items', getLineItemsByPOController)
router.get('/line-items/:id', getLineItemByIdController)
router.delete('/line-items/:id', deleteLineItemController)

export default router
