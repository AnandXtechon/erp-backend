import pool from '../config/db.js';

// Create a new timesheet entry
export const createTimesheet = async (data) => {
  const {
    employee_id,
    employee_name,
    job_id,
    job_name,
    work_date,
    clock_in,
    clock_out,
    break_duration,
    status = 'Clocked In'
  } = data;
  const result = await pool.query(
    `INSERT INTO timesheets 
      (employee_id, employee_name, job_id, job_name, work_date, clock_in, clock_out, break_duration, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [employee_id, employee_name, job_id, job_name, work_date, clock_in, clock_out, break_duration, status]
  );
  return result.rows[0];
};

// Get all timesheets
export const getAllTimesheets = async () => {
  const result = await pool.query('SELECT * FROM timesheets');
  return result.rows;
};

// Get timesheet by ID
export const getTimesheetById = async (id) => {
  const result = await pool.query('SELECT * FROM timesheets WHERE id = $1', [id]);
  return result.rows[0];
};

// Get timesheets for an employee
export const getTimesheetsByEmployee = async (employee_id) => {
  const result = await pool.query('SELECT * FROM timesheets WHERE employee_id = $1', [employee_id]);
  return result.rows;
};

// Update a timesheet entry
export const updateTimesheet = async (id, updates) => {
  const {
    job_id,
    job_name,
    work_date,
    clock_in,
    clock_out,
    break_duration,
    status
  } = updates;
  const result = await pool.query(
    `UPDATE timesheets SET
      job_id = $1,
      job_name = $2,
      work_date = $3,
      clock_in = $4,
      clock_out = $5,
      break_duration = $6,
      status = $7,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING *`,
    [job_id, job_name, work_date, clock_in, clock_out, break_duration, status, id]
  );
  return result.rows[0];
};

// Delete a timesheet entry
export const deleteTimesheet = async (id) => {
  const result = await pool.query('DELETE FROM timesheets WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};


export const getOpenTimesheetToday = async (employee_id) => {
  const result = await pool.query(`
    SELECT * FROM timesheets
    WHERE employee_id = $1 AND work_date = CURRENT_DATE
      AND clock_out IS NULL
    LIMIT 1
  `, [employee_id]);
  return result.rows[0];
};

export const autoClockInTimesheet = async ({ employee_id, employee_name, job_id, job_name, status = 'Clocked In' }) => {
  const result = await pool.query(`
    INSERT INTO timesheets (employee_id, employee_name, job_id, job_name, work_date, clock_in, status)
    VALUES ($1, $2, $3, $4, CURRENT_DATE, CURRENT_TIME, $5)
    RETURNING *
  `, [employee_id, employee_name, job_id, job_name, status]);
  return result.rows[0];
};

export const autoClockOutTimesheet = async (id) => {
  const result = await pool.query(`
    UPDATE timesheets
    SET clock_out = CURRENT_TIME, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `, [id]);
  return result.rows[0];
}

export const getTimeSheetByDateRange = async (startDate, endDate) => {
  const result = await pool.query(`
    SELECT * FROM timesheets
    WHERE AND work_date BETWEEN $1 AND $2
    ORDER BY work_date DESC
  `, [startDate, endDate]);
  return result.rows;
}