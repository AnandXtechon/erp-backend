import {
  getAllCustomers,
  createCustomer,
  updateCustomerById,
  deleteCustomerById,
  getCustomerById,
  updateCustomerNotes,
  getCustomerEmailById,
} from "../models/customer.model.js";

// GET /api/customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};


export const getCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await getCustomerById(id);
    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

export const getCustomerEmailController = async  (req, res) => {
  const { id } = req.params;
  try {
    const email = await getCustomerEmailById(id);
    res.status(200).json({
      success: true,
      email,
    });
  } catch (error) {
    console.error(`Error fetching customer email ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer email",
      error: error.message,
    });
  }
};

// POST /api/customers
export const addCustomer = async (req, res) => {
  const {
    name,
    address,
    pincode,
    country,
    state,
    email,
    phone,
    type,
    status,
  } = req.body;

  // Optional: validate required fields like name and phone
  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name and phone are required",
    });
  }

  try {
    const customer = await createCustomer({
      name,
      address,
      pincode,
      country,
      state,
      email,
      phone,
      type,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

// PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedCustomer = await updateCustomerById(id, updates);
    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    const status = error.message === "Customer not found" ? 404 : 500;
    console.error("Error updating customer:", error.message);
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const { deleted_by } = req.body;

  try {
    const deleted = await deleteCustomerById(id, deleted_by);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: "Customer marked as deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark customer as deleted",
      error: error.message,
    });
  }
};

export const updateCustomerNotesController = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({
      success: false,
      message: "Notes are required",
    });
  }

  try {
    const updatedCustomer = await updateCustomerNotes(id,notes);
    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }     
    res.status(200).json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer notes:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update customer notes",
    });
  }
};
