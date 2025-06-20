import express from "express"
import {
  createInvoiceController,
  getAllInvoicesController,
  getInvoiceByIdController,
  updateInvoiceController,
  deleteInvoiceController,
  getInvoiceByCustomerIdController,
  sendInvoiceEmailController,
} from "../controllers/invoice.controller.js"

const router = express.Router()

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice
 * @access  Private
 */
router.post(
  "/create",
  createInvoiceController
)

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices
 * @access  Private
 */
router.get("/", getAllInvoicesController)

/**
 * @route   GET /api/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get("/:id", getInvoiceByIdController)

router.get("/customer-invoice/:customerId", getInvoiceByCustomerIdController)

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update invoice by ID
 * @access  Private
 */
router.put(
  "/update/:id",
  updateInvoiceController
)

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete invoice by ID
 * @access  Private
 */
router.put("/delete/:id", deleteInvoiceController)

router.post("/send-invoice", sendInvoiceEmailController)
export default router 