import { Router } from 'express';
import {
  updateEmployeeController,
  deleteEmployeeController,
  getEmployeesController,
  getEmployeeByIdController,
  addEmployeeController,
  updateEmployeeStatusController,
  updateEmployeeToggleLoginController,
  getLoggedInEmployeesController
} from '../controllers/employee.controller.js';

const router = Router();

// Get all employees
router.get('/', getEmployeesController);
// Get employee by ID
router.get('/:id', getEmployeeByIdController);

router.get('/get/employee-login', getLoggedInEmployeesController); // Assuming this is to get all logged-in employees
// Create new employee
router.post('/create', addEmployeeController);
// Update employee by ID
router.put('/update/:id', updateEmployeeController);
// Update employee status by ID
router.patch('/update-status/:id', updateEmployeeStatusController);

router.patch('/update/toggle-login/:id', updateEmployeeToggleLoginController) // Uncomment if you have this controller
// Delete employee by ID
router.delete('/delete/:id', deleteEmployeeController);

export default router;
