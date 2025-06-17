import pool from "../config/db.js"

/**
 * Create a new vendor
 * @param {Object} vendorData - The vendor data
 * @returns {Object} The created vendor
 */
export const createVendor = async ({
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
  status = "Active",
  payment_terms,
  tax_id,
  notes,
}) => {
  const result = await pool.query(
    `INSERT INTO vendors (
      name, contact_person, category, email, phone, address, city, state, 
      country, pincode, status, payment_terms, tax_id, notes, is_deleted
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
     name, contact_person, category, email, phone, address, city, state,
      country, pincode, status, payment_terms, tax_id, notes, false
    ]
  )
  return result.rows[0]
}

/**
 * Get all vendors
 * @returns {Array} All vendors
 */
export const getAllVendors = async () => {
  const result = await pool.query(`
    SELECT * FROM vendors 
    WHERE is_deleted = false 
    ORDER BY id DESC
  `)
  return result.rows
}

/**
 * Get vendor by ID
 * @param {number} id - The vendor ID
 * @returns {Object} The vendor
 */
export const getVendorById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM vendors WHERE id = $1 AND is_deleted = false`,
    [id]
  )

  if (result.rows.length === 0) {
    throw new Error("Vendor not found")
  }

  return result.rows[0]
}

/**
 * Update vendor by ID
 * @param {number} id - The vendor ID
 * @param {Object} updates - The updates to apply
 * @returns {Object} The updated vendor
 */
export const updateVendorById = async (id, updates) => {
  // Build the SET clause dynamically based on provided updates
  const setClause = Object.keys(updates)
    .filter(key => key !== 'id' && key !== 'created_at')
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ')

  // Get the values for the SET clause
  const values = Object.keys(updates)
    .filter(key => key !== 'id' && key !== 'created_at')
    .map(key => updates[key])

  // Add the id as the last parameter
  values.push(id)

  const result = await pool.query(
    `UPDATE vendors 
     SET ${setClause}
     WHERE id = $${values.length}
     RETURNING *`,
    values
  )

  if (result.rowCount === 0) {
    throw new Error("Vendor not found")
  }

  return result.rows[0]
}

/**
 * Delete vendor by ID (soft delete)
 * @param {number} id - The vendor ID
 * @param {string} deletedBy - The user who deleted the vendor
 * @returns {boolean} Whether the vendor was deleted
 */
export const deleteVendorById = async (id, deletedBy) => {
  const result = await pool.query(
    `UPDATE vendors
     SET is_deleted = true, deleted_by = $2 
     WHERE id = $1 
     RETURNING id`,
    [id, deletedBy]
  )
  return result.rowCount > 0
}


export const updateVendorNoteById = async (id, note) => {
  const result = await pool.query(
    `UPDATE vendors 
     SET notes = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 AND is_deleted = false 
     RETURNING *`,
    [note, id]
  )

  if (result.rowCount === 0) {
    throw new Error("Vendor not found")
  }

  return result.rows[0]
}