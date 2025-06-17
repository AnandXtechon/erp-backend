import express from 'express';
import {
  addJobController,
  getJobsController,
  getJobByIdController,
  updateJobController,
  deleteJobController,
  getJobsByCustomerIdController,
  updateJobStatusController,
  updateJobNotesController
} from '../controllers/job.controller.js';

const router = express.Router();

// Create a new job
router.post('/create', addJobController);

// Get all jobs
router.get('/', getJobsController);

// Get job by ID
router.get('/:id', getJobByIdController);

// Assuming this is to get jobs by customer ID
router.get('/customer/:customerId', getJobsByCustomerIdController);

// Update job
router.put('/update/:id', updateJobController);

router.patch('/update-status/jobs/:id', updateJobStatusController);
// Delete job
router.delete('/delete/:id', deleteJobController);

router.patch('/update-notes/:id', updateJobNotesController);

export default router;
