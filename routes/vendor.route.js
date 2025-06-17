import express from "express"
import {
  createVendorController,
  getAllVendorsController,
  getVendorByIdController,
  updateVendorController,
  deleteVendorController,
  updateVendorNoteController,
} from "../controllers/vendor.controller.js"

const router = express.Router()

// Create a new vendor
router.post("/create", createVendorController)

// Get all vendors
router.get("/", getAllVendorsController)

// Get vendor by ID
router.get("/vendor/:id", getVendorByIdController)

// Update vendor by ID
router.put("/update/:id", updateVendorController)

// Update note by ID
router.patch("/update-note/:id", updateVendorNoteController)

// Delete vendor by ID
router.patch("/delete/:id", deleteVendorController)

export default router
