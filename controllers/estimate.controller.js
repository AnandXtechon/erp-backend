import {
  createEstimate,
  addEstimateLineItems,
  getAllEstimates,
  getEstimateById,
  updateEstimateById,
  deleteEstimateLineItems,
  deleteEstimateById,
  updateEstimateStatus,
  updateEstimateNotes,
  updateEstimateLineItems,
} from "../models/estimate.model.js"

import html_to_pdf from "html-pdf-node"
import nodemailer from "nodemailer"

/**
 * Get all estimates
 * @route GET /api/estimates
 */
export const getEstimatesController = async (req, res) => {
  try {
    const estimates = await getAllEstimates()
    res.status(200).json({ success: true, estimates })
  } catch (error) {
    console.error("Error fetching estimates:", error.message)
    res.status(500).json({ success: false, message: "Failed to fetch estimates" })
  }
}

/**
 * Get estimate by ID
 * @route GET /api/estimates/:id
 */
export const getEstimateByIdController = async (req, res) => {
  try {
    const { id } = req.params
    const estimate = await getEstimateById(id)
    res.status(200).json({ success: true, estimate })
  } catch (error) {
    console.error("Error fetching estimate:", error.message)
    if (error.message === "Estimate not found") {
      res.status(404).json({ success: false, message: "Estimate not found" })
    } else {
      res.status(500).json({ success: false, message: "Failed to fetch estimate" })
    }
  }
}


/**
 * Create a new estimate
 * @route POST /api/estimates
 */
export const addEstimateController = async (req, res) => {
  // Ensure consistent field naming with database schema
  const { estimate_id, title, description, customer, customer_id, valid_until, status = "Draft", items = [] } = req.body

  // Validate required fields
  if (!estimate_id || !title || !customer || !valid_until) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: estimate_id, title, customer, valid_until",
    })
  }

  // Calculate total safely on backend
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    return sum + qty * rate;
  }, 0);

  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;


  try {
    // Create estimate with total
    const estimate = await createEstimate({
      estimate_id,
      title,
      description,
      customer_id,
      customer,
      valid_until,
      status,
      total,
    })

    // Create related line items (amount will be calculated by database)
    const lineItems = await addEstimateLineItems(estimate.id, items)

    res.status(201).json({
      success: true,
      message: "Estimate created successfully",
      estimate: {
        ...estimate,
        line_items: lineItems,
      },
    })
  } catch (error) {
    console.error("Error creating estimate:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to create estimate",
      error: error.message,
    })
  }
}

/**
 * Update an estimate
 * @route PUT /api/estimates/:id
 */
export const updateEstimateByIdController = async (req, res) => {
  const { id } = req.params;
  const {
    estimate_id,
    title,
    description,
    customer,
    customer_id,
    valid_until,
    status = "Draft",
    items = [],
  } = req.body;

  // Validate required fields
  if (!estimate_id || !title || !customer || !valid_until) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: estimate_id, title, customer, valid_until",
    });
  }

  // Calculate totals
  const subtotal = items.reduce((sum, { quantity = 0, rate = 0 }) => {
    return sum + Number(quantity) * Number(rate);
  }, 0);

  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  try {
    // Step 1: Update estimate details
    const updatedEstimate = await updateEstimateById(id, {
      estimate_id,
      title,
      description,
      customer,
      customer_id,
      valid_until,
      status,
      total,
    });

    // Step 2: Replace line items
    await deleteEstimateLineItems(id); // Remove existing items
    const newLineItems = await addEstimateLineItems(id, items); // Insert new ones

    // Step 3: Respond with updated estimate and line items
    res.status(200).json({
      success: true,
      message: "Estimate updated successfully",
      estimate: {
        ...updatedEstimate,
        line_items: newLineItems,
      },
    });
  } catch (error) {
    console.error("Error updating estimate:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update estimate",
      error: error.message,
    });
  }
};


/**
 * Delete an estimate
 * @route DELETE /api/estimates/:id
 */
export const deleteEstimateByIdController = async (req, res) => {
  const { id } = req.params;
  const { deleted_by } = req.body;

  try {
    const deleted = await deleteEstimateById(id, deleted_by);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: "Estimate marked as deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Estimate not found",
      });
    }
  } catch (error) {
    console.error(`Error deleting estimate ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark estimate as deleted",
      error: error.message,
    });
  }
};

export const updateEstimateStatusController = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const updatedEstimate = await updateEstimateStatus(id, status)
    res.status(200).json({
      success: true,
      data: updatedEstimate,
    })
  } catch (error) {
    console.error("Error updating estimate status:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update estimate status",
      details: error.message,
    })
  }
}

export const updateEstimateNotesController = async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body
    const updatedEstimate = await updateEstimateNotes(id, notes)
    res.status(200).json({
      success: true,
      data: updatedEstimate,
    })
  } catch (error) {
    console.error("Error updating estimate notes:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update estimate notes",
      details: error.message,
    })
  }
}


export const sendEstimateEmailController = async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || typeof to !== 'string' || !/^\S+@\S+\.\S+$/.test(to)) {
    return res.status(400).json({ success: false, message: 'Recipient email (to) is missing or invalid.' });
  }

  // Create PDF buffer from HTML
  const file = { content: htmlContent };
  try {
    const pdfBuffer = await html_to_pdf.generatePdf(file, { format: 'A4' });

    // Send email with PDF attachment
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: 'Please find attached the estimate PDF.',
      attachments: [
        {
          filename: 'estimate.pdf',
          content: pdfBuffer
        }
      ]
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, message: 'Failed to send email', error: err.message });
  }
};