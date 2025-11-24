import { Router } from "express";

import {
  createToolController,
  deleteToolController,
  getToolByListingIdController,
  getToolsByOwnerIdController,
  getToolsController,
  updateToolController,
} from "../controllers/tools.controller";
import {
  getNearbyTools,
  getNearbyToolsGoogleController,
} from "../controllers/findTools.controller";
import { multerErrorHandler, uploadToolImages } from "../middlewares/upload";

const router = Router();

router.post("/all", getToolsController);
router.get("/:listing_id", getToolByListingIdController);
router.get("/owner/:owner_id", getToolsByOwnerIdController);
router.post("/", createToolController);
router.put(
  "/",
  uploadToolImages, // ✅ Multer parses req.body & req.files
  updateToolController,
  multerErrorHandler
);
router.delete("/", deleteToolController);
router.get("/nearby/:userId", getNearbyTools);
router.get("/gooleNearby/:userId", getNearbyToolsGoogleController);

export { router as userCreateRouter };
export { router };
