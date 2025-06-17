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
    if (!['Clocked In', 'On Break', 'Clocked Out'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const employee = await getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updated = await updateEmployeeStatus(id, status);

    // Single fetch for today’s active timesheet
    const todaySheet = await getOpenTimesheetToday(id);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const nowTime = now.toISOString().slice(11, 19); // 'HH:MM:SS' format

    if (status === 'Clocked In') {
      if (!todaySheet) {
        await autoClockInTimesheet({
          employee_id: id,
          employee_name: employee.name,
          job_id: employee.current_job_id,
          job_name: employee.current_job_name,
        });
      }
    } else if (status === 'On Break' && todaySheet) {
      await pool.query(
        `UPDATE timesheets SET break_start_time = $1 WHERE id = $2`,
        [nowTime, todaySheet.id]
      );
    } else if (status === 'Clocked Out' && todaySheet) {
      await pool.query(
        `UPDATE timesheets
         SET clock_out = $1,
             break_duration =
               break_duration +
               CASE WHEN break_start_time IS NOT NULL
                 THEN (clock_out::time - break_start_time)
                 ELSE INTERVAL '0 seconds'
               END,
             break_start_time = NULL
         WHERE id = $2`,
        [nowTime, todaySheet.id]
      );
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
