import { Router } from "express";
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    updateCustomerNotesController,
    getCustomerEmailController,
} from "../controllers/customer.controller.js";

// Create a new router instance
const router = Router();

// Routes for customers
router.get("/", getCustomers); 
router.get("/:id", getCustomer)
router.get("/get/customer-email/:id", getCustomerEmailController) 
router.post("/create", addCustomer);           // POST new customer
router.put("/update/:id", updateCustomer);      // PUT update customer by ID
router.put("/delete/:id", deleteCustomer)
router.patch("/update-notes/:id", updateCustomerNotesController)

// Export the router
export default router;
