import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { createReview } from "../../services/review/create.review.service";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createReviewController = asyncHandler(async (req: Request, res: Response) => {
  const reqBodyValidation = validateRequiredBody(req, res, [
    "userID",
    "transactionID",
    "reviewed_user_id",
    "rating",
    "comment",
  ]);
  if (!reqBodyValidation) return;

  const { userID, transactionID, reviewed_user_id, rating, comment } =
    req.body;

  const newReview = await createReview(
    userID,
    transactionID,
    reviewed_user_id,
    rating,
    comment
  );

  if (!newReview) {
    console.log("Failed to create review");
    return errorResponse(
      res,
      "Failed to create review",
      "Review service returned null (e.g., failed validation or DB error)",
      400
    );
  }
  
  return successResponse(
    res,
    "Review created successfully",
    { review: newReview },
    201
  );
}, "Error creating review");