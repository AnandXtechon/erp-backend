import { updateCustomerStats } from '../models/customer.model.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByCustomerId,
  updateNotesByJobId,
  getUnpaidJobsByCustomerId,
  createJobInventoryUsage,
  updateJobInventoryUsage,
  deleteJobInventoryUsage,
  getJobInventoryUsageByJobId
} from '../models/job.model.js';

// Create a new job
export const addJobController = async (req, res) => {
  try {
    const job = await createJob(req.body);
    await updateCustomerStats(job.customer_id); // Update customer stats after creating a job
    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all jobs
export const getJobsController = async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get job by ID
export const getJobByIdController = async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get jobs by customer ID
export const getJobsByCustomerIdController = async (req, res) => {  
    try {
        const jobs = await getJobsByCustomerId(req.params.customerId);
        if (!jobs || jobs.length === 0) {
        return res.status(404).json({ success: false, message: 'No jobs found for this customer' });
        }
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUnpaidJobsByCustomerIdController = async (req, res) => {
  try {
    const jobs = await getUnpaidJobsByCustomerId(req.params.customerId);
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'No unpaid jobs found for this customer' });
    }
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job
export const updateJobController = async (req, res) => {
  try {
    const updated = await updateJob(req.params.id, req.body);
    await updateCustomerStats(updated.customer_id); // Update customer stats after updating a job
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job status
export const updateJobStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const updated = await updateJob(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job notes
export const updateJobNotesController = async (req, res) => { 
  try {
    const { notes } = req.body;
    if (!notes) {
      return res.status(400).json({ success: false, message: 'Notes are required' });
    }
    const updated = await updateNotesByJobId(req.params.id, notes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Delete job
export const deleteJobController = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming userId is passed in the request body
    const deleted = await deleteJob(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Job Inventory Usage Controllers ---

// Create job inventory usage
export const addJobInventoryUsageController = async (req, res) => {
  try {
    const usage = await createJobInventoryUsage(req.body);
    res.status(201).json({ success: true, data: usage });
  } catch (error) {
    console.error('Error creating job inventory usage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job inventory usage
export const updateJobInventoryUsageController = async (req, res) => {
  try {
    const updated = await updateJobInventoryUsage(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inventory usage record not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating job inventory usage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft delete job inventory usage
export const deleteJobInventoryUsageController = async (req, res) => {
  try {
    const { userId } = req.body; // Optional: who deleted
    const deleted = await deleteJobInventoryUsage(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inventory usage record not found' });
    }
    res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    console.error('Error deleting job inventory usage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getJobInventoryUsageController = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const usage = await getJobInventoryUsageByJobId(jobId);
    if (!usage || usage.length === 0) {
      return res.status(404).json({ success: false, message: 'No inventory usage found for this job' });
    }
    res.status(200).json({ success: true, data: usage });
  } catch (error) {
    console.error('Error fetching job inventory usage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}