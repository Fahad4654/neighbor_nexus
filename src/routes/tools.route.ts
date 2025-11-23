import { Router } from "express";

import {
  createToolController,
  deleteToolController,
  getToolByListingIdController,
  getToolsController,
  updateToolController,
} from "../controllers/tools.controller";
import { getNearbyTools, getNearbyToolsGoogleController } from "../controllers/findTools.controller";

const router = Router();

router.post("/all", getToolsController);
router.get("/:listing_id", getToolByListingIdController);
router.post("/", createToolController);
router.put("/", updateToolController);
router.delete("/", deleteToolController);
router.get("/nearby/:userId", getNearbyTools);
router.get("/gooleNearby/:userId", getNearbyToolsGoogleController);


export { router as userCreateRouter };
export { router };
