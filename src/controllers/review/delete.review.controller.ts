import { Request, Response } from "express";
import { Review } from "../../models/Review";
import { deleteReview } from "../../services/review/delete.review.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function deleteReviewController(req: Request, res: Response) {
  try {
    const { id } = req.body;
    const user = req.user;

    if (!user) {
      return errorResponse(res, "Login required", "Unauthorized access", 401);
    }

    if (!id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing review ID in request body",
        400
      );
    }

    const wantDelReview = await Review.findOne({ where: { review_id: id } });

    if (!wantDelReview) {
      return errorResponse(
        res,
        "Review not found",
        `Review with ID ${id} does not exist`,
        404
      );
    }

    const deletedCount = await deleteReview(id, user.id);

    if (deletedCount === 0) {
      if (wantDelReview.borrower_id !== user.id && !user.isAdmin) {
        return errorResponse(
          res,
          "Forbidden",
          "You are not authorized to delete this review",
          403
        );
      }

      return errorResponse(
        res,
        "Review deletion failed",
        "Review could not be deleted or was already gone",
        404
      );
    }

    return successResponse(
      res,
      "Review deleted successfully",
      { deleted: { id } },
      200
    );
  } catch (error) {
    console.error("Error deleting review:", error);
    return handleUncaughtError(res, error, "Error deleting review");
  }
}
