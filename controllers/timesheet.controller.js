import {
  createTimesheet,
  getAllTimesheets,
  getTimesheetById,
  getTimesheetsByEmployee,
  updateTimesheet,
  deleteTimesheet
} from '../models/timesheet.model.js';

// Create a new timesheet
export const addTimesheet = async (req, res) => {
  try {
    const timesheet = await createTimesheet(req.body);
    res.status(201).json({ success: true, timesheet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all timesheets
export const getTimesheets = async (req, res) => {
  try {
    const timesheets = await getAllTimesheets();
    res.status(200).json({ success: true, timesheets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get timesheet by ID
export const getTimesheet = async (req, res) => {
  try {
    const timesheet = await getTimesheetById(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ success: false, message: 'Timesheet not found' });
    }
    res.status(200).json({ success: true, timesheet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get timesheets by employee
export const getEmployeeTimesheets = async (req, res) => {
  try {
    const timesheets = await getTimesheetsByEmployee(req.params.employee_id);
    res.status(200).json({ success: true, timesheets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update timesheet
export const updateTimesheetController = async (req, res) => {
  try {
    const updated = await updateTimesheet(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Timesheet not found' });
    }
    res.status(200).json({ success: true, timesheet: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete timesheet
export const deleteTimesheetController = async (req, res) => {
  try {
    const deleted = await deleteTimesheet(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Timesheet not found' });
    }
    res.status(200).json({ success: true, timesheet: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
