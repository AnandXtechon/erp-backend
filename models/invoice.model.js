import pool from "../config/db.js"

/**
 * Create a new invoice
 * @param {Object} invoiceData - The invoice data
 * @returns {Object} The created invoice
 */
export const createInvoice = async ({
  invoice_id,
  description,
  customer_name,
  customer_id,
  job_code,
  category,
  due_date,
  status = "Draft",
  payment_terms,
  tax_rate,
  discount_rate,
  subtotal,
  tax_amount,
  discount_amount,
  total,
  notes,
}) => {
  const result = await pool.query(
    `INSERT INTO invoices (
      invoice_id, description, customer_name, customer_id, job_code, category, due_date, 
      status, payment_terms, tax_rate, discount_rate, subtotal,
      tax_amount, discount_amount, total, notes, is_deleted
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *`,
    [
      invoice_id, description, customer_name, customer_id, job_code, category, due_date,
      status, payment_terms, tax_rate, discount_rate, subtotal,
      tax_amount, discount_amount, total, notes, false
    ]
  )
  return result.rows[0]
}

/**
 * Insert line items in bulk
 * @param {number} invoice_id - The invoice ID
 * @param {Array} items - The line items
 * @returns {Array} The created line items
 */
export const addInvoiceLineItems = async (invoice_id, items) => {
  // If no items, return empty array
  if (!items || items.length === 0) {
    return []
  }

  const values = items.map(({ description, quantity, unit, rate }) => [
    invoice_id,
    description,
    Number(quantity || 0),
    unit || 'unit',
    Number(rate || 0),
  ])

  const placeholders = values
    .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
    .join(", ")

  const flatValues = values.flat()

  const result = await pool.query(
    `INSERT INTO invoice_line_items 
     (invoice_id, description, quantity, unit, rate) 
     VALUES ${placeholders}
     RETURNING *`,
    flatValues
  )

  return result.rows
}

/**
 * Get all invoices with line items
 * @returns {Array} All invoices with line items
 */
export const getAllInvoices = async () => {
  const result = await pool.query(`
    SELECT 
      i.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', li.id,
          'invoice_id', li.invoice_id,
          'description', li.description,
          'quantity', li.quantity,
          'unit', li.unit,
          'rate', li.rate,
          'amount', li.amount
        )
      ) FILTER (WHERE li.id IS NOT NULL), '[]') AS line_items
    FROM invoices i
    LEFT JOIN invoice_line_items li ON i.id = li.invoice_id
    WHERE i.is_deleted = false
    GROUP BY i.id
    ORDER BY i.id DESC
  `)
  return result.rows
}

/**
 * Get invoice by ID with line items
 * @param {number} id - The invoice ID
 * @returns {Object} The invoice with line items
 */
export const getInvoiceById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      i.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', li.id,
          'invoice_id', li.invoice_id,
          'description', li.description,
          'quantity', li.quantity,
          'unit', li.unit,
          'rate', li.rate,
          'amount', li.amount
        )
      ) FILTER (WHERE li.id IS NOT NULL), '[]') AS line_items
    FROM invoices i
    LEFT JOIN invoice_line_items li ON i.id = li.invoice_id
    WHERE i.id = $1
    GROUP BY i.id
  `,
    [id]
  )

  if (result.rows.length === 0) {
    throw new Error("Invoice not found")
  }

  return result.rows[0]
}

export const getInvoicesByCustomerId = async (customerId) => {
  const result = await pool.query(`
    SELECT 
      i.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', li.id,
          'invoice_id', li.invoice_id,
          'description', li.description,
          'quantity', li.quantity,
          'unit', li.unit,
          'rate', li.rate,
          'amount', li.amount
        )
      ) FILTER (WHERE li.id IS NOT NULL), '[]') AS line_items
    FROM invoices i
    LEFT JOIN invoice_line_items li ON i.id = li.invoice_id
    WHERE i.customer_id = $1 AND i.is_deleted = false
    GROUP BY i.id
    ORDER BY i.id DESC
  `, [customerId])
  return result.rows
}

/**
 * Update invoice by ID
 * @param {number} id - The invoice ID
 * @param {Object} updates - The updates to apply
 * @returns {Object} The updated invoice
 */
export const updateInvoiceById = async (id, updates) => {
  // Remove line_items and other non-database fields
  const { line_items, ...dbUpdates } = updates;

  // Build the SET clause dynamically based on provided updates
  const setClause = Object.keys(dbUpdates)
    .filter(key => key !== 'id' && key !== 'created_at')
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ')

  // Get the values for the SET clause
  const values = Object.keys(dbUpdates)
    .filter(key => key !== 'id' && key !== 'created_at')
    .map(key => dbUpdates[key])

  // Add the id as the last parameter
  values.push(id)

  const result = await pool.query(
    `UPDATE invoices 
     SET ${setClause}
     WHERE id = $${values.length}
     RETURNING *`,
    values
  )

  if (result.rowCount === 0) {
    throw new Error("Invoice not found")
  }

  return result.rows[0]
}

/**
 * Delete existing line items by invoice_id
 * @param {number} invoice_id - The invoice ID
 */
export const deleteInvoiceLineItems = async (invoice_id) => {
  await pool.query(`DELETE FROM invoice_line_items WHERE invoice_id = $1`, [invoice_id])
}

/**
 * Delete invoice by ID (soft delete)
 * @param {number} id - The invoice ID
 * @param {string} deletedBy - The user who deleted the invoice
 * @returns {boolean} Whether the invoice was deleted
 */
export const deleteInvoiceById = async (id, deletedBy) => {
  const result = await pool.query(
    `UPDATE invoices
     SET is_deleted = true, deleted_by = $2 
     WHERE id = $1 
     RETURNING id`,
    [id, deletedBy]
  )
  return result.rowCount > 0
}
