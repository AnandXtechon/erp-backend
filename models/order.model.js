import pool from '../config/db.js'

// Purchase Orders
export const getAllPurchaseOrders = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        po.*,
        COALESCE(json_agg(
          json_build_object(
            'id', li.id,
            'po_id', li.po_id,
            'description', li.description,
            'quantity', li.quantity,
            'unit', li.unit,
            'rate', li.rate,
            'amount', li.amount,
            'created_at', li.created_at,
            'updated_at', li.updated_at
          )
        ) FILTER (WHERE li.id IS NOT NULL), '[]') AS purchase_order_line_items
      FROM purchase_orders po
      LEFT JOIN purchase_order_line_items li ON po.id = li.po_id
      WHERE po.is_deleted = false
      GROUP BY po.id
      ORDER BY po.created_at DESC
    `)
    return result.rows
  } catch (error) {
    throw new Error('Failed to fetch purchase orders')
  }
}

export const getPurchaseOrderById = async (id) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        po.*,
        COALESCE(json_agg(
          json_build_object(
            'id', li.id,
            'po_id', li.po_id,
            'description', li.description,
            'quantity', li.quantity,
            'unit', li.unit,
            'rate', li.rate,
            'amount', li.amount,
            'created_at', li.created_at,
            'updated_at', li.updated_at
          )
        ) FILTER (WHERE li.id IS NOT NULL), '[]') AS purchase_order_line_items
      FROM purchase_orders po
      LEFT JOIN purchase_order_line_items li ON po.id = li.po_id
      WHERE po.id = $1 AND po.is_deleted = false
      GROUP BY po.id
      `,
      [id]
    )
    if (result.rows.length === 0) throw new Error('Purchase order not found')
    return result.rows[0]
  } catch (error) {
    if (error.message === 'Purchase order not found') throw error
    throw new Error('Failed to fetch purchase order')
  }
}

export const getPurchaseOrderByVendorId = async (vendor_id) => {
  try {
    const result = await pool.query(
      ` SELECT
        po.*,
        COALESCE(json_agg(
          json_build_object(
            'id', li.id,
            'po_id', li.po_id,
            'description', li.description,
            'quantity', li.quantity,
            'unit', li.unit,
            'rate', li.rate,
            'amount', li.amount,
            'created_at', li.created_at,
            'updated_at', li.updated_at
          )
        ) FILTER (WHERE li.id IS NOT NULL), '[]') AS purchase_order_line_items
      FROM purchase_orders po
      LEFT JOIN purchase_order_line_items li ON po.id = li.po_id
      WHERE po.vendor_id = $1 AND po.is_deleted = false
      GROUP BY po.id
      ORDER BY po.created_at DESC
      `,
      [vendor_id]
    )
    return result.rows
  } catch (error) {
    console.error('Error fetching purchase orders by vendor ID:', error)
    throw new Error('Failed to fetch purchase orders by vendor ID')
  }
}

export const getLastOrderDateByVendorId = async (vendor_id) => {
  try {
    const result = await pool.query(
      `SELECT MAX(order_date) AS last_order_date
       FROM purchase_orders
       WHERE vendor_id = $1 AND is_deleted = false`,
      [vendor_id]
    )
    return result.rows[0].last_order_date || null
  } catch (error) {
    console.error('Error fetching last order date:', error)
    throw new Error('Failed to fetch last order date')
  }
}


export const createPurchaseOrder = async (data) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const {
      purchase_order_number,
      vendor_name,
      vendor_id,
      order_date,
      delivery_date,
      description,
      payment_terms,
      tax_rate,
      status,
      purchase_order_line_items = [],
    } = data

    // Insert purchase order
    const poResult = await client.query(
      `INSERT INTO purchase_orders 
       (purchase_order_number, vendor_name, vendor_id, order_date, delivery_date, description, payment_terms, tax_rate, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [purchase_order_number, vendor_name, vendor_id, order_date, delivery_date, description, payment_terms, tax_rate, status]
    )
    const po = poResult.rows[0]

    // Insert line items
    for (const item of purchase_order_line_items) {
      await client.query(
        `INSERT INTO purchase_order_line_items 
         (po_id, description, quantity, unit, rate)
         VALUES ($1, $2, $3, $4, $5)`,
        [po.id, item.description, item.quantity, item.unit, item.rate]
      )
    }

    await client.query('COMMIT')
    return getPurchaseOrderById(po.id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw new Error('Failed to create purchase order')
  } finally {
    client.release()
  }
}

export const updatePurchaseOrder = async (id, data) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      vendor_name,
      vendor_id,
      order_date,
      delivery_date,
      description,
      payment_terms,
      tax_rate,
      status,
      purchase_order_line_items = [],
    } = data

    // First check if purchase order exists
    const checkResult = await client.query(
      `SELECT id FROM purchase_orders WHERE id = $1 AND is_deleted = false`,
      [id]
    )

    if (checkResult.rows.length === 0) {
      throw new Error('Purchase order not found')
    }

    // Update purchase order
    const poResult = await client.query(
      `UPDATE purchase_orders 
       SET vendor_name = $1, 
           vendor_id = $2, 
           order_date = $3, 
           delivery_date = $4, 
           description = $5, 
           payment_terms = $6, 
           tax_rate = $7, 
           status = $8, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $9 AND is_deleted = false
       RETURNING *`,
      [vendor_name, vendor_id, order_date, delivery_date, description, payment_terms, tax_rate, status, id]
    )
    // Remove existing line items
    await client.query(
      `DELETE FROM purchase_order_line_items WHERE po_id = $1`,
      [id]
    )

    // Insert new line items
    for (const item of purchase_order_line_items) {
      await client.query(
        `INSERT INTO purchase_order_line_items 
         (po_id, description, quantity, unit, rate)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item.description, item.quantity, item.unit, item.rate]
      )
    }

    await client.query('COMMIT')
    return getPurchaseOrderById(id)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in updatePurchaseOrder:', error)
    if (error.message === 'Purchase order not found') throw error
    throw new Error(`Failed to update purchase order: ${error.message}`)
  } finally {
    client.release()
  }
}

export const deletePurchaseOrder = async (id, deletedBy = null) => {
  try {
    const result = await pool.query(
      `UPDATE purchase_orders 
       SET is_deleted = true, 
           deleted_by = $2,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND is_deleted = false
       RETURNING id`,
      [id, deletedBy]
    )
    
    if (result.rows.length === 0) {
      throw new Error('Purchase order not found')
    }
    
    return true
  } catch (error) {
    if (error.message === 'Purchase order not found') throw error
    throw new Error('Failed to delete purchase order')
  }
}

// Line Items
export const getLineItemsByPO = async (po_id) => {
  try {
    const result = await pool.query(
      `SELECT * FROM purchase_order_line_items 
       WHERE po_id = $1 
       ORDER BY created_at DESC`,
      [po_id]
    )
    return result.rows
  } catch (error) {
    throw new Error('Failed to fetch line items')
  }
}

export const getLineItemById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT * FROM purchase_order_line_items WHERE id = $1`,
      [id]
    )
    if (result.rows.length === 0) throw new Error('Line item not found')
    return result.rows[0]
  } catch (error) {
    if (error.message === 'Line item not found') throw error
    throw new Error('Failed to fetch line item')
  }
}

export const deleteLineItem = async (id) => {
  try {
    const result = await pool.query(
      `DELETE FROM purchase_order_line_items WHERE id = $1 RETURNING id`,
      [id]
    )
    if (result.rows.length === 0) {
      throw new Error('Line item not found')
    }
    return true
  } catch (error) {
    if (error.message === 'Line item not found') throw error
    throw new Error('Failed to delete line item')
  }
}
