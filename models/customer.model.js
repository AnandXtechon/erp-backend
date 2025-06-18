import pool from '../config/db.js';

/**
 * Fetch all customers from the database
 */
export const getAllCustomers = async () => {
  const result = await pool.query('SELECT * FROM customer WHERE is_deleted=false ORDER BY id DESC');
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
}) => {
  const result = await pool.query(
    `INSERT INTO customer 
      (name, address, pincode, country, state, email, phone, type, status) 
     VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
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
    jobs,
    revenue,
  } = updates;

  const result = await pool.query(
    `UPDATE customer SET 
      name = $1,
      address = $2,
      pincode = $3,
      country = $4,
      state = $5,
      email = $6,
      phone = $7,
      type = $8,
      status = $9,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $10 RETURNING *`,
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
    `UPDATE customer 
     SET is_deleted = true, deleted_by = $2 
     WHERE id = $1 
     RETURNING id`,
    [id, deletedBy]
  );
  return result.rowCount > 0;
};


export const getCustomerById = async (id) => {
  const result = await pool.query(`SELECT * FROM customer WHERE id = $1`, [id]);
  if (result.rows.length === 0) {
    throw new Error("Customer not found")
  }
  return result.rows[0];
};



// updateCustomerStats.js
export const updateCustomerStats = async (customerId) => {
  const result = await pool.query(
    `
    UPDATE customer c SET 
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


