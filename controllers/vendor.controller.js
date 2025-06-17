import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendorById,
  deleteVendorById,
  updateVendorNoteById,
} from "../models/vendor.model.js"

/**
 * Create a new vendor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createVendorController = async (req, res) => {
  try {
    const {
      name,
      contact_person,
      category,
      email,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      status,
      payment_terms,
      tax_id,
      notes,
    } = req.body

    const vendor = await createVendor({
      name,
      contact_person,
      category,
      email,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      status,
      payment_terms,
      tax_id,
      notes,
    })

    res.status(201).json({
      success: true,
      data: vendor,
    })
  } catch (error) {
    console.error("Error creating vendor:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create vendor",
      details: error.message,
    })
  }
}

/**
 * Get all vendors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllVendorsController = async (req, res) => {
  try {
    const vendors = await getAllVendors()
    res.status(200).json({
      success: true,
      data: vendors,
    })
  } catch (error) {
    console.error("Error fetching vendors:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch vendors",
      details: error.message,
    })
  }
}

/**
 * Get vendor by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVendorByIdController = async (req, res) => {
  try {
    const { id } = req.params
    const vendor = await getVendorById(id)
    res.status(200).json({
      success: true,
      data: vendor,
    })
  } catch (error) {
    console.error("Error fetching vendor:", error)
    if (error.message === "Vendor not found") {
      return res.status(404).json({
        success: false,
        error: "Vendor not found",
      })
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch vendor",
      details: error.message,
    })
  }
}

/**
 * Update vendor by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateVendorController = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Validate status if it's being updated
    if (updates.status && !['Active', 'Inactive', 'Suspended'].includes(updates.status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: Active, Inactive, Suspended"
      })
    }

    // Get the current vendor to ensure it exists
    const currentVendor = await getVendorById(id)

    // Update the vendor
    const updatedVendor = await updateVendorById(id, {
      ...currentVendor,
      ...updates,
      updated_at: new Date()
    })

    res.status(200).json({
      success: true,
      data: updatedVendor,
    })
  } catch (error) {
    console.error("Error updating vendor:", error)
    if (error.message === "Vendor not found") {
      return res.status(404).json({
        success: false,
        error: "Vendor not found",
      })
    }
    res.status(500).json({
      success: false,
      error: "Failed to update vendor",
      details: error.message,
    })
  }
}

/**
 * Upate note for vendor by ID
 */

export const updateVendorNoteController = async (req, res) => {
  try {
    const { id } = req.params
    const { note } = req.body

    // Validate note content
    if (!note || typeof note !== 'string' || note.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Note cannot be empty",
      })
    }


    // Update the vendor's note
    const updatedVendor = await updateVendorNoteById(id, note)
    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found",
      })
    }
    console.log("Updated vendor note:", updatedVendor)
    res.status(200).json({
      success: true,
      data: updatedVendor,
    })
  } catch (error) {
    console.error("Error updating vendor note:", error)
    if (error.message === "Vendor not found") {
      return res.status(404).json({
        success: false,
        error: "Vendor not found",
      })
    }
    res.status(500).json({
      success: false,
      error: "Failed to update vendor note",
      details: error.message,
    })
  }
} 

/**
 * Delete vendor by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteVendorController = async (req, res) => {
  try {
    const { id } = req.params
    const deletedBy = req.body // Get user ID from auth middleware if available

    const deleted = await deleteVendorById(id, deletedBy)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting vendor:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete vendor",
      details: error.message,
    })
  }
}
