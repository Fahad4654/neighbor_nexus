import { Router } from "express";
import { createReviewController } from "../controllers/review/create.review.controller";
import { deleteReviewController } from "../controllers/review/delete.review.controller";
import {
  getAllReviewsController,
  getReviewByReviewIdController,
  getReviewsByRevieweeIdController,
  getReviewsByReviewerIdController,
  getReviewsBytransactionIdController,
} from "../controllers/review/get.review.controller";
import { updateReviewController } from "../controllers/review/update.review.controller";

const router = Router();

router.post("/reviewee/:id", getReviewsByRevieweeIdController);
router.post("/reviewer/:id", getReviewsByReviewerIdController);
router.post("/transaction/:id", getReviewsBytransactionIdController);
router.get("/:review_id", getReviewByReviewIdController);
router.post("/", createReviewController);
router.post("/all", getAllReviewsController);
router.put("/", updateReviewController);
router.delete("/", deleteReviewController);

export { router as userCreateRouter };
export { router };
