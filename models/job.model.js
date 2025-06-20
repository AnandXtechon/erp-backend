import pool from '../config/db.js';
import { updateCustomerStats } from './customer.model.js';

// Helper to get progress from status
const getProgressFromStatus = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'to do': return 0;
    case 'ready': return 0;
    case 'in progress': return 40;
    case 'in review': return 75;
    case 'completed': return 100;
    default: return 0;
  }
};

// Create a new job
export const createJob = async (data) => {
  const {
    job_code,
    job_title,
    description,
    customer_id,
    customer_name,
    priority,
    status,
    assigned_to,
    category,
    location,
    start_date,
    due_date,
    expected_end_date,
    estimated_hours = 0,
    project_value,
    notes
  } = data;
  const progress = getProgressFromStatus(status);
  const result = await pool.query(
    `INSERT INTO jobs (
      job_code, job_title, description, customer_id, customer_name, priority, status, assigned_to, category, location, start_date, due_date, expected_end_date, estimated_hours, project_value, notes, progress
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING *`,
    [job_code, job_title, description, customer_id, customer_name, priority, status, assigned_to, category, location, start_date, due_date, expected_end_date, estimated_hours, project_value, notes, progress]
  );
  return result.rows[0];
};

// Get all jobs
export const getAllJobs = async () => {
  const result = await pool.query('SELECT * FROM jobs WHERE is_deleted = FALSE ORDER BY id DESC');
  return result.rows;
};

// Get job by ID
export const getJobById = async (id) => {
  const result = await pool.query('SELECT * FROM jobs WHERE id = $1 AND is_deleted = FALSE', [id]);
  return result.rows[0];
};

export const getJobsByCustomerId = async (customerId) => {
    const result = await pool.query('SELECT * FROM jobs WHERE customer_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC', [customerId]);
    return result.rows;
}

export const getUnpaidJobsByCustomerId = async (customerId) => {
  const result = await pool.query(
    `SELECT * FROM jobs 
     WHERE customer_id = $1 
       AND is_deleted = FALSE 
       AND is_paid = FALSE 
     ORDER BY created_at DESC`,
    [customerId]
  );
  return result.rows;
};


// Update a job
export const updateJob = async (id, updates) => {
  // Always set progress based on status if status is present
  if (updates.status) {
    updates.progress = getProgressFromStatus(updates.status);
  }
  const fields = [];
  const values = [];
  let idx = 1;
  for (const key in updates) {
    fields.push(`${key} = $${idx}`);
    values.push(updates[key]);
    idx++;
  }
  values.push(id);
  const result = await pool.query(
    `UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const updateJobStatus = async (id, status) => {
  const progress = getProgressFromStatus(status);
  const result = await pool.query(
    'UPDATE jobs SET status = $1, progress = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [status, progress, id]
  );
  return result.rows[0];
};


export const updateNotesByJobId = async (id, notes) => {
  const result = await pool.query(
    'UPDATE jobs SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [notes, id]
  );
  return result.rows[0];
}


// Delete a job
export const deleteJob = async (id, userId) => {
  const result = await pool.query('UPDATE jobs SET is_deleted = TRUE, deleted_by = $1 WHERE id = $2 RETURNING *', [userId, id]);
  return result.rows[0];
};


// --- Job Inventory Usage CRUD ---

// Create job inventory usage record
export const createJobInventoryUsage = async ({
  job_id,
  job_code,
  item_name,
  item_code,
  rate,
  margin,
  quantity_used,
}) => {
  // Calculate amount
  const amount = Number(quantity_used) * Number(rate);
  const result = await pool.query(
    `INSERT INTO job_inventory_usage (
      job_id, job_code, item_name, item_code, rate, margin, quantity_used, amount
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [job_id, job_code, item_name, item_code, rate, margin, quantity_used, amount]
  );
  return result.rows[0];
};

// Update job inventory usage record
export const updateJobInventoryUsage = async (id, updates) => {
  // Map frontend 'code' to DB 'item_code'
  if (updates.code) {
    updates.item_code = updates.code;
    delete updates.code;
  }
  // Prevent multiple assignments to updated_at
  if ('updated_at' in updates) {
    delete updates.updated_at;
  }
  const fields = [];
  const values = [];
  let idx = 1;
  for (const key in updates) {
    fields.push(`${key} = $${idx}`);
    values.push(updates[key]);
    idx++;
  }
  values.push(id);
  const result = await pool.query(
    `UPDATE job_inventory_usage SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

// Soft delete job inventory usage record
export const deleteJobInventoryUsage = async (id, userId = null) => {
  const result = await pool.query(
    'UPDATE job_inventory_usage SET is_deleted = TRUE, deleted_by = $1, deleted_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [userId, id]
  );
  return result.rows[0];
};

export const getJobInventoryUsageByJobId = async (jobId) => {
  const result = await pool.query(
    'SELECT * FROM job_inventory_usage WHERE job_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC',
    [jobId]
  );
  return result.rows;
}