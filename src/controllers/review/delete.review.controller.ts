import { Request, Response } from "express";
import { Review } from "../../models/Review";
import { deleteReview } from "../../services/review/delete.review.service";
import { successResponse, errorResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const {review_id } = req.body;
    const user = req.user;

    if (!user) {
      return errorResponse(res, "Login required", "Unauthorized access", 401);
    }

    if (!review_id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing review ID in request body",
        400
      );
    }

    const wantDelReview = await Review.findOne({ where: { review_id } });

    if (!wantDelReview) {
      return errorResponse(
        res,
        "Review not found",
        `Review with ID ${review_id} does not exist`,
        404
      );
    }

    if (wantDelReview.reviewer_id !== user.id && !user.isAdmin) {
      return errorResponse(
        res,
        "Forbidden",
        "You are not authorized to delete this review",
        403
      );
    }

    const deletedCount = await deleteReview(review_id, user.id);

    return successResponse(
      res,
      "Review deleted successfully",
      { deleted: { review_id } },
      200
    );
  },
  "Error deleting review"
);
