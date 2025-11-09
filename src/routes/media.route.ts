import { Router } from "express";
import { MediaController } from "../controllers/media.controller";
import { uploadSingle, uploadMultiple } from "../middlewares/upload";

const router = Router();

router.post("/upload", uploadSingle, MediaController.uploadFile);
router.post("/uploads", uploadMultiple, MediaController.uploadFiles);

export { router as mediaRouter };
export { router };
