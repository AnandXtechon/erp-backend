import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceById,
  deleteInvoiceById,
  addInvoiceLineItems,
  deleteInvoiceLineItems,
  getInvoicesByCustomerId, 
} from "../models/invoice.model.js"

/**
 * Create a new invoice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createInvoiceController = async (req, res) => {
  try {
    const {
      invoice_id,
      description,
      customer_name,
      customer_id,
      job_code,
      category,
      due_date,
      status,
      payment_terms,
      tax_rate,
      discount_rate,
      subtotal,
      tax_amount,
      discount_amount,
      total,
      notes,
      line_items,
    } = req.body

    // Create the invoice
    const invoice = await createInvoice({
      invoice_id,
      description,
      customer_name,
      customer_id,
      job_code,
      category,
      due_date,
      status,
      payment_terms,
      tax_rate,
      discount_rate,
      subtotal,
      tax_amount,
      discount_amount,
      total,
      notes,
    })

    // Add line items if provided
    if (line_items && line_items.length > 0) {
      await addInvoiceLineItems(invoice.id, line_items)
    }

    // Get the complete invoice with line items
    const completeInvoice = await getInvoiceById(invoice.id)

    res.status(201).json({
      success: true,
      data: completeInvoice,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create invoice",
      details: error.message,
    })
  }
}

/**
 * Get all invoices
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllInvoicesController = async (req, res) => {
  try {
    const invoices = await getAllInvoices()
    res.status(200).json({
      success: true,
      data: invoices,
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoices",
      details: error.message,
    })
  }
}

/**
 * Get invoice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getInvoiceByIdController = async (req, res) => {
  try {
    const { id } = req.params
    const invoice = await getInvoiceById(id)
    res.status(200).json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    if (error.message === "Invoice not found") {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      })
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice",
      details: error.message,
    })
  }
}

export const getInvoiceByCustomerIdController = async (req, res) => {
  try {
    const { customerId } = req.params
    const invoices = await getInvoicesByCustomerId(customerId)
    res.status(200).json({
      success: true,
      data: invoices,
    })
  } catch (error) {
    console.error("Error fetching invoices by customer ID:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoices",
      details: error.message,
    })
  }
}

/**
 * Update invoice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateInvoiceController = async (req, res) => {
  try {
    const { id } = req.params
    const { line_items, ...updates } = req.body

    // Validate status if it's being updated
    if (updates.status && !['Draft', 'Sent', 'Paid'].includes(updates.status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: Draft, Sent, Paid"
      })
    }

    // Get the current invoice to ensure it exists
    const currentInvoice = await getInvoiceById(id)

    // Update the invoice
    const updatedInvoice = await updateInvoiceById(id, {
      ...currentInvoice,
      ...updates,
      updated_at: new Date()
    })

    // Update line items if provided
    if (line_items) {
      // Delete existing line items
      await deleteInvoiceLineItems(id)
      // Add new line items
      if (line_items.length > 0) {
        await addInvoiceLineItems(id, line_items)
      }
    }

    // Get the complete updated invoice
    const completeInvoice = await getInvoiceById(id)

    res.status(200).json({
      success: true,
      data: completeInvoice,
    })
  } catch (error) {
    console.error("Error updating invoice:", error)
    if (error.message === "Invoice not found") {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      })
    }
    res.status(500).json({
      success: false,
      error: "Failed to update invoice",
      details: error.message,
    })
  }
}

/**
 * Delete invoice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteInvoiceController = async (req, res) => {
  try {
    const { id } = req.params
    const deletedBy = req.body // Get user ID from auth middleware if available

    const deleted = await deleteInvoiceById(id, deletedBy)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete invoice",
      details: error.message,
    })
  }
}


