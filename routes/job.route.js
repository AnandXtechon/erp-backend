import express from 'express';
import {
  addJobController,
  getJobsController,
  getJobByIdController,
  updateJobController,
  deleteJobController,
  getJobsByCustomerIdController,
  updateJobStatusController,
  updateJobNotesController,
  getUnpaidJobsByCustomerIdController,
  addJobInventoryUsageController,
  updateJobInventoryUsageController,
  getJobInventoryUsageController,
  deleteJobInventoryUsageController
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

router.get('/unpaid-jobs/:customerId', getUnpaidJobsByCustomerIdController);

// Update job
router.put('/update/:id', updateJobController);

router.patch('/update-status/jobs/:id', updateJobStatusController);
// Delete job
router.patch('/delete/:id', deleteJobController);

router.patch('/update-notes/:id', updateJobNotesController);

router.post('/job-inventory-usage/create', addJobInventoryUsageController)

router.put('/job-inventory-usage/update/:id', updateJobInventoryUsageController)

router.get('/job-inventory-usage/:jobId', getJobInventoryUsageController)

router.patch('/delete/job-inventory-usage/:id', deleteJobInventoryUsageController)

export default router;
