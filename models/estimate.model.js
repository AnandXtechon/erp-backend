import pool from "../config/db.js"

/**
 * Create a new estimate
 * @param {Object} estimateData - The estimate data
 * @returns {Object} The created estimate
 */
export const createEstimate = async ({
  estimate_id,
  title,
  description,
  customer_id,
  customer,
  valid_until,
  status = "Draft",
  total = 0,
}) => {
  const result = await pool.query(
    `INSERT INTO estimates (estimate_id, title, description, customer_id, customer, valid_until, status, total, is_deleted, deleted_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [estimate_id, title, description, customer_id, customer, valid_until, status, total, false, null],
  )
  return result.rows[0]
}

/**
 * Insert line items in bulk (without amount - let database calculate it)
 * @param {number} estimate_id - The estimate ID
 * @param {Array} items - The line items
 * @returns {Array} The created line items
 */
export const addEstimateLineItems = async (estimate_id, items) => {
  // If no items, return empty array
  if (!items || items.length === 0) {
    return []
  }

  const values = items.map(({ item, quantity, unit, rate, amount }) => [
    estimate_id,
    item,
    Number(quantity || 0),
    unit,
    Number(rate || 0),
    Number(amount || 0),
  ])

  const placeholders = values
    .map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`)
    .join(", ")

  const flatValues = values.flat()

  const result = await pool.query(
    `INSERT INTO estimate_line_items 
     (estimate_id, item, quantity, unit, rate, amount) 
     VALUES ${placeholders}
     RETURNING *`,
    flatValues,
  )

  return result.rows
}

export const updateEstimateLineItems = async (items) => {
  if (!items || items.length === 0) {
    return []
  }

  // Prepare values: [id, item, quantity, unit, rate, amount]
  const values = items.map(({ id, item, quantity, unit, rate, amount }) => [
    id,
    item,
    Number(quantity || 0),
    unit,
    Number(rate || 0),
    Number(amount || 0),
  ])

  const flatValues = values.flat()

  const placeholders = values
    .map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`)
    .join(', ')

  const result = await pool.query(
    `
    UPDATE estimate_line_items AS eli SET
      item = data.item,
      quantity = data.quantity,
      unit = data.unit,
      rate = data.rate,
      amount = data.amount
    FROM (
      VALUES ${placeholders}
    ) AS data(id, item, quantity, unit, rate, amount)
    WHERE eli.id = data.id
    RETURNING eli.*
    `,
    flatValues
  )

  return result.rows
}


/**
 * Get all estimates with line items
 * @returns {Array} All estimates with line items
 */

export const getAllEstimates = async () => {
  const result = await pool.query(`
    SELECT 
      e.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', li.id,
          'estimate_id', li.estimate_id,
          'item', li.item,
          'quantity', li.quantity,
          'unit', li.unit,
          'rate', li.rate,
          'amount', COALESCE(li.amount, li.quantity * li.rate)
        )
      ) FILTER (WHERE li.id IS NOT NULL), '[]') AS line_items
    FROM estimates e
    LEFT JOIN estimate_line_items li ON e.id = li.estimate_id
    WHERE e.is_deleted = false
    GROUP BY e.id
    ORDER BY e.id DESC
  `)
  return result.rows
}


/**
 * Get estimate by ID with line items
 * @param {number} id - The estimate ID
 * @returns {Object} The estimate with line items
 */
export const getEstimateById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      e.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', li.id,
          'estimate_id', li.estimate_id,
          'item', li.item,
          'quantity', li.quantity,
          'unit', li.unit,
          'rate', li.rate,
          'amount', COALESCE(li.amount, li.quantity * li.rate)
        )
      ) FILTER (WHERE li.id IS NOT NULL), '[]') AS line_items
    FROM estimates e
    LEFT JOIN estimate_line_items li ON e.id = li.estimate_id
    WHERE e.id = $1
    GROUP BY e.id
  `,
    [id],
  )

  if (result.rows.length === 0) {
    throw new Error("Estimate not found")
  }

  return result.rows[0]
}

/**
 * Update estimate by ID
 * @param {number} id - The estimate ID
 * @param {Object} updates - The updates to apply
 * @returns {Object} The updated estimate
 */
export const updateEstimateById = async (id, updates) => {
  const { estimate_id, title, description, customer_id, customer, valid_until, status, total } = updates
  const result = await pool.query(
    `UPDATE estimates SET 
      estimate_id = $1,
      title = $2,
      description = $3,
      customer_id = $4,
      customer = $5,
      valid_until = $6,
      status = $7,
      total = $8,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
     RETURNING *`,
    [estimate_id, title, description, customer_id, customer, valid_until, status, total, id],
  )
  

  if (result.rowCount === 0) {
    throw new Error("Estimate not found")
  }

  return result.rows[0]
}

/**
 * Delete existing line items by estimate_id
 * @param {number} estimate_id - The estimate ID
 */
export const deleteEstimateLineItems = async (estimate_id) => {
  await pool.query(`DELETE FROM estimate_line_items WHERE estimate_id = $1`, [estimate_id])
}

/**
 * Delete estimate by ID
 * @param {number} id - The estimate ID
 * @returns {boolean} Whether the estimate was deleted
 */

export const deleteEstimateById = async (id, deletedBy) => {
  const result = await pool.query(
    `UPDATE estimates
     SET is_deleted = true, deleted_by = $2 
     WHERE id = $1 
     RETURNING id`,
    [id, deletedBy]
  );
  return result.rowCount > 0;
};

export const updateEstimateStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE estimates SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

export const updateEstimateNotes = async (id, notes) => {
  const result = await pool.query(
    `UPDATE estimates SET notes = $1 WHERE id = $2 RETURNING *`,
    [notes, id]
  );
  return result.rows[0];
};


