import express from "express";
import {
  getEstimatesController,
  addEstimateController,
  updateEstimateByIdController,
  deleteEstimateByIdController,
  getEstimateByIdController,
  updateEstimateStatusController,
  updateEstimateNotesController,
  sendEstimateEmailController
} from "../controllers/estimate.controller.js";

const router = express.Router();

router.get("/", getEstimatesController);
router.post("/create", addEstimateController);
router.put("/update/:id", updateEstimateByIdController);
router.patch("/delete/:id", deleteEstimateByIdController) 
router.get("/:id", getEstimateByIdController)
router.patch("/status/:id", updateEstimateStatusController)
router.patch("/update-notes/:id", updateEstimateNotesController)
router.post("/send-estimate", sendEstimateEmailController)

export default router;
