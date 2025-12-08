import { Router } from "express";
import { createReviewController } from "../controllers/review/create.review.controller";
import { deleteReviewController } from "../controllers/review/delete.review.controller";
import { getReviewsByIdController } from "../controllers/review/get.review.controller";
import { updateReviewController } from "../controllers/review/update.review.controller";

const router = Router();

router.get("/:id", getReviewsByIdController);
router.post("/", createReviewController);
router.put("/", updateReviewController);
router.delete("/", deleteReviewController);

export { router as userCreateRouter };
export { router };
