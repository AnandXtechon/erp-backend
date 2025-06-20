import pool from '../config/db.js';

/**
 * Fetch all customers from the database
 */
export const getAllCustomers = async () => {
  const result = await pool.query('SELECT * FROM customers WHERE is_deleted=false ORDER BY id DESC');
  return result.rows;
};

/**
 * Create a new customer
 */
export const createCustomer = async ({
  name,
  address,
  pincode,
  country,
  state,
  email,
  phone,
  type = 'Residential',
  status = 'Active',
  notes = '',
}) => {
  const result = await pool.query(
    `INSERT INTO customers 
      (name, address, pincode, country, state, email, phone, type, status, notes) 
     VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
     RETURNING *`,
    [
      name,
      address,
      pincode,
      country,
      state,
      email,
      phone,
      type,
      status,
      notes,
    ]
  );
  return result.rows[0];

};

/**
 * Update an existing customer by ID
 */
export const updateCustomerById = async (id, updates) => {
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
    notes,

  } = updates;

  const result = await pool.query(
    `UPDATE customers SET 
      name = $1,
      address = $2,
      pincode = $3,
      country = $4,
      state = $5,
      email = $6,
      phone = $7,
      type = $8,
      status = $9,
      notes = $10,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $11 RETURNING *`,
    [
      name,
      address,
      pincode,
      country,
      state,
      email,
      phone,
      type,
      status,
      notes,
      id,
    ]
  );

  if (result.rowCount === 0) {
    throw new Error('Customer not found');
  }

  return result.rows[0];
};


export const deleteCustomerById = async (id, deletedBy) => {
  const result = await pool.query(
    `UPDATE customers
     SET is_deleted = true, deleted_by = $2 
     WHERE id = $1 
     RETURNING id`,
    [id, deletedBy]
  );
  return result.rowCount > 0;
};


export const getCustomerById = async (id) => {
  const result = await pool.query(`SELECT * FROM customers WHERE id = $1`, [id]);
  if (result.rows.length === 0) {
    throw new Error("Customer not found")
  }
  return result.rows[0];
};

export const getCustomerEmailById = async (id) => {
  const result = await pool.query(`SELECT email FROM customers WHERE id = $1`, [id]);
  if (result.rows.length === 0) {
    throw new Error("Customer not found")
  }
  return result.rows[0].email;
};



// updateCustomerStats.js
export const updateCustomerStats = async (customerId) => {
  const result = await pool.query(
    `
    UPDATE customers c SET 
      revenue = COALESCE(j.total_value, 0),
      jobs = COALESCE(j.job_count, 0)
    FROM (
      SELECT 
        customer_id,
        SUM(project_value) AS total_value,
        COUNT(*) AS job_count
      FROM jobs
      WHERE is_deleted = false
      GROUP BY customer_id
    ) j
    WHERE c.id = j.customer_id AND c.id = $1
    RETURNING c.*;
    `,
    [customerId]
  );

  return result.rows[0]; // updated customer
};

export const updateCustomerNotes = async (id, notes) => {
  const result = await pool.query(
    `UPDATE customers SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [notes, id]
  );
  if (result.rowCount === 0) {
    throw new Error('Customer not found');
  }
  return result.rows[0];
};


