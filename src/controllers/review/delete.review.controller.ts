import { Request, Response } from "express";
import { deleteReview } from "../../services/review/delete.review.service";
import { successResponse, errorResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const { review_id } = req.body;
    const user = req.user;

    // 1. Authentication Check
    if (!user) {
      return errorResponse(res, "Login required", "Unauthorized access", 401);
    }

    if (!review_id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing review ID",
        400
      );
    }

    try {
      // 2. Call the service
      // We pass user.id and let the service decide if they are reviewer, reviewee, or admin
      await deleteReview(review_id, user.id);

      return successResponse(
        res,
        "Review deleted successfully",
        { review_id },
        200
      );
    } catch (error: any) {
      // 3. Handle specific service errors (like "Unauthorized" or "Not found")
      const statusCode = error.message.includes("Unauthorized") ? 403 : 404;
      return errorResponse(res, error.message, "Service Error", statusCode);
    }
  },
  "Error deleting review"
);
