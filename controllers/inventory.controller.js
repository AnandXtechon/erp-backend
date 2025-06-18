import e from "express"
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItemById,
  deleteInventoryItemById,
  getInventoryItemsByCategory,
  getInventoryItemsBySearch,
  getInventoryItemsBySKU,
  getInventoryItemsByWarehouse,
  getInventoryItemsByVendor,
} from "../models/inventory.model.js"

/**
 * Get all inventory items
 * @route GET /api/inventory
 */
export const getInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await getAllInventoryItems()
    res.status(200).json({ success: true, inventory: inventoryItems })
  } catch (error) {
    console.error("Error fetching inventory items:", error.message)
    res.status(500).json({ success: false, message: "Failed to fetch inventory items" })
  }
}

/**
 * Get inventory item by ID
 * @route GET /api/inventory/:id
 */
export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params
    const inventoryItem = await getInventoryItemById(id)
    res.status(200).json({ success: true, data: inventoryItem })
  } catch (error) {
    console.error("Error fetching inventory item:", error.message)
    if (error.message === "Inventory item not found") {
      res.status(404).json({ success: false, message: "Inventory item not found" })
    } else {
      res.status(500).json({ success: false, message: "Failed to fetch inventory item" })
    }
  }
}

export const getInventoryItemByCategory = async (req, res) => {
  const { category } = req.params

  try {
    const inventoryItems = await getInventoryItemsByCategory(category)
    res.status(200).json({ success: true, data: inventoryItems })
  } catch (error) {
    console.error("Error fetching inventory items by category:", error.message)
    res.status(500).json({ success: false, message: "Failed to fetch inventory items by category" })
  }
}

export const getInventoryItemByVendor = async (req, res) => {
  const { vendor } = req.params 
  try {
    const inventoryItems = await getInventoryItemsByVendor(vendor)
    res.status(200).json({ success: true, data: inventoryItems })
  } catch (error) {
    console.error("Error fetching inventory items by vendor:", error.message)
    res.status(500).json({ success: false, message: "Failed to fetch inventory items by vendor" })
  }
}

export const getInventoryItemByWarehouse = async (req, res) => {
  const { warehouse } = req.params
  try {
    const inventoryItems = await getInventoryItemsByWarehouse(warehouse)
    res.status(200).json({ success: true, data: inventoryItems })
  } catch (error) {
    console.error("Error fetching inventory items by warehouse:", error.message)
    res.status(500).json({ success: false, message: "Failed to fetch inventory items by warehouse" })
  }
}

export const getInventoryItemBySKU = async (req, res) => {
  const { sku } = req.params

  try {
    const inventoryItems = await getInventoryItemsBySKU(sku)
    res.status(200).json({ success: true, data: inventoryItems })
  } catch (error) {
    console.error("Error fetching inventory items by SKU:", error.message)
    res.status(500).json({ success: false, message: "Failed to fetch inventory items by SKU" })
  }
}

export const getInventoryItemBySearch = async (req, res) => {
  const search  = req.query.q;
  if (!search || search.trim() === "") {
    return res.status(400).json({ success: false, message: "Missing search query" });
  }
  try {
    const inventoryItems = await getInventoryItemsBySearch(search)
    res.status(200).json({ success: true, data: inventoryItems })
  } catch (error) {
    console.error("Error fetching inventory items by search:", error.message)
    res.status(500).json({ success: false, message: "Failed to fetch inventory items by search" })
  }
}

/**
 * Create a new inventory item
 * @route POST /api/inventory
 */
export const addInventoryItem = async (req, res) => {
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
  } = req.body

  try {
    const inventoryItem = await createInventoryItem({
      name,
      sku,
      category,
      vendor,
      current_stock: Number(current_stock),
      min_stock: Number(min_stock),
      max_stock: Number(max_stock),
      cost_price: Number(cost_price),
      selling_price: Number(selling_price),
      warehouse,
      status: status || "Active",
      last_updated,
    })

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      inventory: inventoryItem,
    })
  } catch (error) {
    console.error("Error creating inventory item:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
      error: error.message,
    })
  }
}

/**
 * Update an inventory item
 * @route PUT /api/inventory/:id
 */
export const updateInventoryItem = async (req, res) => {
  const { id } = req.params
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
  } = req.body


  try {
    const updatedInventoryItem = await updateInventoryItemById(id, {
      name,
      sku,
      category,
      vendor,
      current_stock: Number(current_stock),
      min_stock: Number(min_stock),
      max_stock: Number(max_stock),
      cost_price: Number(cost_price),
      selling_price: Number(selling_price),
      warehouse,
      status,
      last_updated,
    })

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      inventory: updatedInventoryItem,
    })
  } catch (error) {
    console.error("Error updating inventory item:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
      error: error.message,
    })
  }
}

/**
 * Delete an inventory item
 * @route DELETE /api/inventory/:id
 */

export const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { deleted_by } = req.body;

  try {
    const deleted = await deleteInventoryItemById(id, deleted_by);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: "Inventory item marked as deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark inventory item as deleted",
      error: error.message,
    });
  }
};
