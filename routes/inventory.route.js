import express from "express";
import { addInventoryItem, deleteInventoryItem, getInventoryItem, getInventoryItems, updateInventoryItem } from "../controllers/inventory.controller.js";

const router = express.Router();

router.get("/", getInventoryItems);
router.get("/:id", getInventoryItem);
router.post("/create", addInventoryItem);
router.put("/update/:id", updateInventoryItem); 
router.put("/delete/:id", deleteInventoryItem)

export default router;
