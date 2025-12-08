import { Router } from "express";
import { multerErrorHandler, uploadToolImages } from "../middlewares/upload";
import { getNearbyToolsGoogleController } from "../controllers/global/findTools.controller";
import { createToolController } from "../controllers/tools/create.tools.controller";
import { deleteToolController } from "../controllers/tools/delete.tools.controller";
import {
  getToolsController,
  getToolByListingIdController,
  getToolsByOwnerIdController,
} from "../controllers/tools/get.tools.controller";
import { updateToolInfoController } from "../controllers/tools/update.tools.controller";
import { updateToolImagesController } from "../controllers/tools/updateImages.tools.controller";

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
