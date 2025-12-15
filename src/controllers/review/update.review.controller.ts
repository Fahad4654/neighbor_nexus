import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";
import { updateReview } from "../../services/review/update.review.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function updateReviewController(req: Request, res: Response) {
  try {
    if (!req.body.id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing ID in request body",
        400
      );
    }

    const typedWantUpReview = await findByDynamicId(
      Review,
      { id: req.body.id },
      false
    );
    const wantUpReview = typedWantUpReview as Review | null;

    if (!wantUpReview) {
      return errorResponse(
        res,
        "Review Not found",
        `Review with ID ${req.body.id} does not exist`,
        404
      );
    }

    const updatedReview = await updateReview(req.body);

    if (!updatedReview) {
      console.log(
        "No valid fields to update or review update failed (e.g., unauthorized or no change)"
      );
      return errorResponse(
        res,
        "Update Failed",
        "No valid fields provided for update, review not found, or user unauthorized",
        400
      );
    }

    console.log("Review updated successfully");
    return successResponse(
      res,
      "Review updated successfully",
      { review: updatedReview },
      200
    );
  } catch (error) {
    console.error("Error updating review:", error);
    return handleUncaughtError(res, error, "Error updating review");
  }
}
