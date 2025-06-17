import { Router } from "express";
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
} from "../controllers/customer.controller.js";

// Create a new router instance
const router = Router();

// Routes for customers
router.get("/", getCustomers);           // GET all customers
router.post("/create", addCustomer);           // POST new customer
router.put("/update/:id", updateCustomer);      // PUT update customer by ID
router.put("/delete/:id", deleteCustomer)
router.get("/:id", getCustomer)
// Export the router
export default router;
