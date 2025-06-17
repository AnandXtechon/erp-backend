import pool from '../config/db.js';

// Create a new employee
export const createEmployee = async (employee) => {
  const {
    name,
    position,
    status = 'Clocked Out',
    current_job_id,
    current_job_name,
    today_hours,
    weekly_hours,
    hourly_rate,
  } = employee;
  const result = await pool.query(
    `INSERT INTO employees 
      (name, position, status, current_job_id, current_job_name, today_hours, weekly_hours, hourly_rate)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, position, status, current_job_id, current_job_name, today_hours, weekly_hours, hourly_rate]
  );
  return result.rows[0];
};

// Get all employees
export const getAllEmployees = async () => {
  const result = await pool.query('SELECT * FROM employees ORDER BY id DESC');
  return result.rows;
};


// Get employee by ID
export const getEmployeeById = async (id) => {
  const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
  return result.rows[0];
};

export const getAllLoginEmployees = async () => {
  const result = await pool.query(
    'SELECT * FROM employees WHERE is_logged_in = true ORDER BY id DESC',
  );
  return result.rows;
};


// Update employee
export const updateEmployee = async (id, updates) => {
  const {
    name,
    position,
    status,
    current_job_id,
    current_job_name,
    today_hours,
    weekly_hours,
    hourly_rate,
  } = updates;
  const result = await pool.query(
    `UPDATE employees SET
      name = $1,
      position = $2,
      status = $3,
      current_job_id = $4,
      current_job_name = $5,
      today_hours = $6,
      weekly_hours = $7,
      hourly_rate = $8,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING *`,
    [name, position, status, current_job_id, current_job_name, today_hours, weekly_hours, hourly_rate, id]
  );
  return result.rows[0];
};

export const updateEmployeeStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE employees SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

export const updateEmployeeToggleLogin = async (id) => {
    const result = await pool.query(
        `UPDATE employees SET is_logged_in = NOT is_logged_in WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
}



// Delete employee
export const deleteEmployee = async (id) => {
  const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};