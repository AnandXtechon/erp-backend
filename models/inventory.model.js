import pool from "../config/db.js"

/**
 * Create a new inventory item
 * @param {Object} inventoryData - The inventory item data
 * @returns {Object} The created inventory item
 */
export const createInventoryItem = async ({

  name,
  sku,
  category,
  vendor,
  current_stock,
  min_stock,
  max_stock,
  cost_price,
  selling_price,
  warehouse,
  status,
  last_updated,
}) => {
  const result = await pool.query(
    `INSERT INTO inventory(
  name, sku, category, vendor, current_stock, min_stock, max_stock,
  cost_price, selling_price, warehouse, status, last_updated, is_deleted, deleted_by
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
 RETURNING *`
    ,
    [
      name,
      sku,
      category,
      vendor,
      current_stock,
      min_stock,
      max_stock,
      cost_price,
      selling_price,
      warehouse,
      status,
      last_updated,
      is_deleted,
      deleted_by,
    ],
  )
  return result.rows
}

/**
 * Get all inventory items
 * @returns {Array} All inventory items
 */
export const getAllInventoryItems = async () => {
  const result = await pool.query(`
    SELECT * FROM inventory WHERE is_deleted=false
    ORDER BY id DESC 
  `)
  return result.rows
}

/**
 * Get inventory item by ID
 * @param {number} id - The inventory item ID
 * @returns {Object} The inventory item
 */
export const getInventoryItemById = async (id) => {
  const result = await pool.query(`SELECT * FROM inventory WHERE id = $1`, [id])

  if (result.rows.length === 0) {
    throw new Error("Inventory item not found")
  }

  return result.rows[0]
}

/**
 * Update inventory item by ID
 * @param {number} id - The inventory item ID
 * @param {Object} updates - The updates to apply
 * @returns {Object} The updated inventory item
 */
export const updateInventoryItemById = async (id, updates) => {
  const {

    name,
    sku,
    category,
    vendor,
    current_stock,
    min_stock,
    max_stock,
    cost_price,
    selling_price,
    warehouse,
    status,
    last_updated,
  } = updates

  const result = await pool.query(
    `UPDATE inventory SET 
      name = $1,
      sku = $2,
      category = $3,
      vendor = $4,
      current_stock = $5,
      min_stock = $6,
      max_stock = $7,
      cost_price = $8,
      selling_price = $9,
      warehouse = $10,
      status = $11,
      last_updated = $12,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $13
     RETURNING *`,
    [

      name,
      sku,
      category,
      vendor,
      current_stock,
      min_stock,
      max_stock,
      cost_price,
      selling_price,
      warehouse,
      status,
      last_updated,
      id,
    ],
  )

  if (result.rowCount === 0) {
    throw new Error("Inventory item not found")
  }

  return result.rows[0]
}

/**
 * Delete inventory item by ID
 * @param {number} id - The inventory item ID
 * @returns {boolean} Whether the inventory item was deleted
 */
export const deleteInventoryItemById = async (id, deletedBy) => {
  const result = await pool.query(
    `UPDATE inventory 
     SET is_deleted = true, deleted_by = $2 
     WHERE id = $1 
     RETURNING id`,
    [id, deletedBy]
  )
  return result.rowCount > 0
}


/**
 * Update stock quantity for an inventory item
 * @param {number} id - The inventory item ID
 * @param {number} quantity - The new stock quantity
 * @param {string} reason - The reason for stock adjustment
 * @returns {Object} The updated inventory item
 */
// export const updateStockQuantityById = async (id, quantity, reason) => {
//   // First, get the current item to check min_stock for status update
//   const currentItem = await getInventoryItemById(id)

//   // Determine new status based on stock levels
//   let newStatus = "Active"
//   if (quantity === 0) {
//     newStatus = "Out of Stock"
//   } else if (quantity <= currentItem.min_stock) {
//     newStatus = "Low Stock"
//   }

//   const result = await pool.query(
//     `UPDATE inventory SET
//       current_stock = $1,
//       status = $2,
//       last_updated = CURRENT_TIMESTAMP,
//       updated_at = CURRENT_TIMESTAMP
//      WHERE id = $3
//      RETURNING *`,
//     [quantity, newStatus, id],
//   )

//   if (result.rowCount === 0) {
//     throw new Error("Inventory item not found")
//   }

//   // Log the stock adjustment (you might want to create a separate stock_movements table)
//   await pool.query(
//     `INSERT INTO stock_movements (inventory_item_id, quantity_change, reason, created_at)
//      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
//     [id, quantity - currentItem.current_stock, reason],
//   )

//   return result.rows[0]
// }

/**
 * Get low stock items (current_stock <= min_stock)
 * @returns {Array} Low stock inventory items
 */
// export const getLowStockItems = async () => {
//   const result = await pool.query(`
//     SELECT * FROM inventory
//     WHERE current_stock <= min_stock AND status != 'Inactive'
//     ORDER BY current_stock ASC
//   `)
//   return result.rows
// }
