import { Router } from "express";
import { createReviewController, deleteReviewController, getReviewsByIdController, updateReviewController } from "../controllers/review.controller";


const router = Router();

router.get("/:id", getReviewsByIdController);
router.post("/", createReviewController);
router.put("/", updateReviewController);
router.delete("/", deleteReviewController);

export { router as userCreateRouter };
export { router };
