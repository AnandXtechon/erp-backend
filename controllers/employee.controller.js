import pool from '../config/db.js';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getAllLoginEmployees,
  updateEmployeeToggleLogin
} from '../models/employee.model.js';
import {
  createTimesheet,
  updateTimesheet,
  getTimesheetsByEmployee,
  getOpenTimesheetToday,
  autoClockInTimesheet
} from '../models/timesheet.model.js';

// Create a new employee
export const addEmployeeController = async (req, res) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all employees
export const getEmployeesController = async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee by ID
export const getEmployeeByIdController = async (req, res) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all logged-in employees
export const getLoggedInEmployeesController = async (req, res) => {
  try {
    const employees = await getAllLoginEmployees();
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Update employee
export const updateEmployeeController = async (req, res) => {
  try {
    const updated = await updateEmployee(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployeeStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Clocked In', 'On Break', 'Returned', 'Clocked Out'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const employee = await getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updated = await updateEmployeeStatus(id, status);
    const todaySheet = await getOpenTimesheetToday(id);
    const now = new Date();
    // Always use HH:MM:SS for time fields
    const nowTime = now.toTimeString().slice(0, 8); // 'HH:MM:SS'

    if (status === 'Clocked In') {
      if (!todaySheet) {
        await autoClockInTimesheet({
          employee_id: id,
          employee_name: employee.name,
          job_id: employee.current_job_id,
          job_name: employee.current_job_name,
          status: 'Clocked In',
        });
      } else {
        await pool.query(
          `UPDATE timesheets SET status = $1 WHERE id = $2`,
          ['Clocked In', todaySheet.id]
        );
      }
    } else if (status === 'On Break' && todaySheet) {
      await pool.query(
        `UPDATE timesheets SET break_start_time = $1, status = $2 WHERE id = $3`,
        [nowTime, 'On Break', todaySheet.id]
      );
    } else if (status === 'Returned' && todaySheet) {
      await pool.query(
        `UPDATE timesheets
         SET break_duration = break_duration + (CURRENT_TIME - break_start_time)::interval,
             break_start_time = NULL,
             status = $1
         WHERE id = $2`,
        ['Returned', todaySheet.id]
      );
    } else if (status === 'Clocked Out' && todaySheet) {
      // If on break, finalize break duration up to nowTime
      if (todaySheet.break_start_time) {
        await pool.query(
          `UPDATE timesheets
           SET clock_out = $1,
               break_duration = break_duration + ($1::time - break_start_time),
               break_start_time = NULL,
               status = $2
           WHERE id = $3`,
          [nowTime, 'Clocked Out', todaySheet.id]
        );
      } else {
        await pool.query(
          `UPDATE timesheets
           SET clock_out = $1,
               status = $2
           WHERE id = $3`,
          [nowTime, 'Clocked Out', todaySheet.id]
        );
      }
    }

    res.status(200).json({ success: true, employee: updated });
  } catch (error) {
    console.error('Toggle login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateEmployeeToggleLoginController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await updateEmployeeToggleLogin(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete employee
export const deleteEmployeeController = async (req, res) => {
  try {
    const deleted = await deleteEmployee(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
