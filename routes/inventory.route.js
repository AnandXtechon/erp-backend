import express from "express";
import { addInventoryItem, deleteInventoryItem, getInventoryItem, getInventoryItemByCategory, getInventoryItemBySearch, getInventoryItems, updateInventoryItem } from "../controllers/inventory.controller.js";

const router = express.Router();

router.get("/", getInventoryItems);
router.post("/create", addInventoryItem);
router.put("/update/:id", updateInventoryItem);
router.put("/delete/:id", deleteInventoryItem);
router.get("/search", getInventoryItemBySearch);
router.get("/category/:category", getInventoryItemByCategory);
router.get("/:id", getInventoryItem);


export default router;
