import { Router } from 'express';
import {
  addTimesheet,
  getTimesheets,
  getTimesheet,
  getEmployeeTimesheets,
  updateTimesheetController,
  deleteTimesheetController
} from '../controllers/timesheet.controller.js';

const router = Router();

// Get all timesheets
router.get('/', getTimesheets);
// Get timesheet by ID
router.get('/:id', getTimesheet);
// Get timesheets by employee
router.get('/employee/:employee_id', getEmployeeTimesheets);
// Create new timesheet
router.post('/create', addTimesheet);
// Update timesheet by ID
router.put('/update/:id', updateTimesheetController);
// Delete timesheet by ID
router.delete('/delete/:id', deleteTimesheetController);

export default router;
