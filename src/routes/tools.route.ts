import { Router } from "express";

import {
  createToolController,
  deleteToolController,
  getToolByListingIdController,
  getToolsByOwnerIdController,
  getToolsController,
  updateToolImagesController,
  updateToolInfoController,
} from "../controllers/tools/tools.controller";

import { multerErrorHandler, uploadToolImages } from "../middlewares/upload";
import { getNearbyToolsGoogleController } from "../controllers/global/findTools.controller";

const router = Router();

router.post("/all", getToolsController);
router.get("/:listing_id", getToolByListingIdController);
router.get("/owner/:owner_id", getToolsByOwnerIdController);
router.post("/", createToolController);
router.put("/update-info", updateToolInfoController);
router.put(
  "/update-images",
  uploadToolImages, // Multer handles file upload
  updateToolImagesController,
  multerErrorHandler
);
router.delete("/", deleteToolController);
router.get("/gooleNearby/:userId", getNearbyToolsGoogleController);

export { router as userCreateRouter };
export { router };
