import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByCustomerId,
  updateNotesByJobId
} from '../models/job.model.js';

// Create a new job
export const addJobController = async (req, res) => {
  try {
    const job = await createJob(req.body);

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

// Update job
export const updateJobController = async (req, res) => {
  try {
    const updated = await updateJob(req.params.id, req.body);
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

// Delete job
export const deleteJobController = async (req, res) => {
  try {
    const deleted = await deleteJob(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job: deleted });
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