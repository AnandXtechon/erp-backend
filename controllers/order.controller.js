import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getPurchaseOrderByVendorId,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getLineItemsByPO,
  getLineItemById,
  deleteLineItem,
  getLastOrderDateByVendorId,
} from '../models/order.model.js'

export const getAllPurchaseOrdersController = async (req, res) => {
  try {
    const orders = await getAllPurchaseOrders()
    res.status(200).json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch purchase orders' })
  }
}

export const getPurchaseOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ success: false, error: 'Purchase order ID is required' })
    }
    const order = await getPurchaseOrderById(id)
    res.status(200).json({ success: true, data: order })
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    if (error.message === 'Purchase order not found') {
      return res.status(404).json({ success: false, error: error.message })
    }
    res.status(500).json({ success: false, error: 'Failed to fetch purchase order' })
  }
}


export const getPurchaseOrderByVendorIdController = async (req, res) => {
  try {
    const { vendor_id } = req.params
    if (!vendor_id) {
      return res.status(400).json({ success: false, error: 'Vendor ID is required' })
    }

    const orders = await getPurchaseOrderByVendorId(vendor_id) // ✅ Corrected line
    res.status(200).json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching purchase orders by vendor ID:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch purchase orders by vendor ID' })
  }
}

export const getLastOrderDateController = async (req, res) => {
  try {
    const { vendor_id } = req.params
    if (!vendor_id) {
      return res.status(400).json({ success: false, error: 'Vendor ID is required' })
    }

    const lastOrderDate = await getLastOrderDateByVendorId(vendor_id)
    res.status(200).json({ success: true, data: lastOrderDate })
  } catch (error) {
    console.error('Error in getLastOrderDateController:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch last order date' })
  }
}


export const createPurchaseOrderController = async (req, res) => {
  try {
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
      purchase_order_line_items = [] 
    } = req.body
    
    // Validate required fields for purchase order
    if (!purchase_order_number || !vendor_name || !order_date || !delivery_date || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: purchase_order_number, vendor_name, order_date, delivery_date, status' 
      })
    }

    // Validate line items if provided
    if (purchase_order_line_items.length > 0) {
      for (const item of purchase_order_line_items) {
        if (!item.description || !item.quantity || !item.rate) {
          return res.status(400).json({
            success: false,
            error: 'Each line item must have description, quantity, and rate'
          })
        }
        // Validate numeric fields
        if (isNaN(item.quantity) || isNaN(item.rate)) {
          return res.status(400).json({
            success: false,
            error: 'Quantity and rate must be numeric values'
          })
        }
        // Set default unit if not provided
        if (!item.unit) {
          item.unit = 'unit'
        }
      }
    }

    const order = await createPurchaseOrder({
      purchase_order_number,
      vendor_name,
      vendor_id,
      order_date,
      delivery_date,
      description,
      payment_terms,
      tax_rate,
      status,
      purchase_order_line_items
    })
    res.status(201).json({ success: true, data: order })
  } catch (error) {
    console.error('Error creating purchase order:', error)
    res.status(400).json({ success: false, error: 'Failed to create purchase order' })
  }
}

export const updatePurchaseOrderController = async (req, res) => {
  try {
    const { id } = req.params
    const { 
      vendor_name, 
      vendor_id,
      order_date, 
      delivery_date, 
      description,
      payment_terms,
      tax_rate,
      status,
      purchase_order_line_items = [] 
    } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Purchase order ID is required' })
    }

    // Validate required fields
    // if (!vendor_name || !order_date || !delivery_date || !status) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     error: 'Missing required fields: vendor_name, order_date, delivery_date, status' 
    //   })
    // }

    // Validate line items if provided
    if (purchase_order_line_items.length > 0) {
      for (const item of purchase_order_line_items) {
        if (!item.description || !item.quantity || !item.rate) {
          return res.status(400).json({
            success: false,
            error: 'Each line item must have description, quantity, and rate'
          })
        }
        // Validate numeric fields
        if (isNaN(item.quantity) || isNaN(item.rate)) {
          return res.status(400).json({
            success: false,
            error: 'Quantity and rate must be numeric values'
          })
        }
        // Set default unit if not provided
        if (!item.unit) {
          item.unit = 'unit'
        }
      }
    }

    const order = await updatePurchaseOrder(id, {
      vendor_name,
      vendor_id,
      order_date,
      delivery_date,
      description,
      payment_terms,
      tax_rate,
      status,
      purchase_order_line_items
    })
    res.status(200).json({ success: true, data: order })
  } catch (error) {
    console.error('Error updating purchase order:', error)
    if (error.message === 'Purchase order not found') {
      return res.status(404).json({ success: false, error: error.message })
    }
    res.status(400).json({ success: false, error: 'Failed to update purchase order' })
  }
}

export const deletePurchaseOrderController = async (req, res) => {
  try {
    const { id } = req.params
    const { deletedBy } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Purchase order ID is required' })
    }

    await deletePurchaseOrder(id, deletedBy)
    res.status(200).json({ success: true, message: 'Purchase order deleted successfully' })
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    if (error.message === 'Purchase order not found') {
      return res.status(404).json({ success: false, error: error.message })
    }
    res.status(400).json({ success: false, error: 'Failed to delete purchase order' })
  }
}

// Line Items
export const getLineItemsByPOController = async (req, res) => {
  try {
    const { po_id } = req.params
    if (!po_id) {
      return res.status(400).json({ success: false, error: 'Purchase order ID is required' })
    }
    const items = await getLineItemsByPO(po_id)
    res.status(200).json({ success: true, data: items })
  } catch (error) {
    console.error('Error fetching line items:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch line items' })
  }
}

export const getLineItemByIdController = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ success: false, error: 'Line item ID is required' })
    }
    const item = await getLineItemById(id)
    res.status(200).json({ success: true, data: item })
  } catch (error) {
    console.error('Error fetching line item:', error)
    if (error.message === 'Line item not found') {
      return res.status(404).json({ success: false, error: error.message })
    }
    res.status(500).json({ success: false, error: 'Failed to fetch line item' })
  }
}

export const deleteLineItemController = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ success: false, error: 'Line item ID is required' })
    }
    await deleteLineItem(id)
    res.status(200).json({ success: true, message: 'Line item deleted successfully' })
  } catch (error) {
    console.error('Error deleting line item:', error)
    if (error.message === 'Line item not found') {
      return res.status(404).json({ success: false, error: error.message })
    }
    res.status(400).json({ success: false, error: 'Failed to delete line item' })
  }
}
