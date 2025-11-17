import { Router } from "express";

import {
  createToolController,
  deleteToolController,
  getToolByListingIdController,
  getToolsController,
  updateToolController,
} from "../controllers/tools.controller";

const router = Router();

router.post("/all", getToolsController);
router.get("/:listing_id", getToolByListingIdController);
router.post("/", createToolController);
router.put("/", updateToolController);
router.delete("/", deleteToolController);

export { router as userCreateRouter };
export { router };
