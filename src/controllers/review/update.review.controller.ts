import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";
import { updateReview } from "../../services/review/update.review.service";
import { successResponse, errorResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../../models/User";

export const updateReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) {
      return errorResponse(
        res,
        "User not found",
        "User not found in request",
        404
      );
    }
    const typedUser = await findByDynamicId(User, { id: reqUser.id }, false);
    const user = typedUser as User;
    if (!req.body.review_id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing ID in request body",
        400
      );
    }

    console.log(req.body);
    const typedWantUpReview = await findByDynamicId(
      Review,
      { review_id: req.body.review_id },
      false
    );
    const wantUpReview = typedWantUpReview as Review | null;

    if (!wantUpReview) {
      return errorResponse(
        res,
        "Review Not found",
        `Review with ID ${req.body.review_id} does not exist`,
        404
      );
    }

    if (!user.isAdmin && req.body.approved) {
      return errorResponse(
        res,
        "Unauthorized",
        "User is not authorized to update this review",
        401
      );
    }

    if (!user.isAdmin && req.body.approvedBy) {
      return errorResponse(
        res,
        "Unauthorized",
        "User is not authorized to update this review",
        401
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
  },
  "Error updating review"
);
