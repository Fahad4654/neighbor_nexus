import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function getReviewsByIdController(req: Request, res: Response) {
  try {
    const review_id = req.params.id;
    console.log("Review ID:", review_id);

    if (!review_id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing review ID in route parameter",
        400
      );
    }

    const typedReview = await findByDynamicId(Review, { id: review_id }, false);
    const review = typedReview as Review | null;
    console.log(review);

    if (!review) {
      console.log("Review not found");
      return errorResponse(
        res,
        "Review not found",
        `Review with ID ${review_id} does not exist`,
        404
      );
    }

    return successResponse(
      res,
      "Review fetched successfully",
      { review: review },
      200
    );
  } catch (error) {
    console.error("Error finding review:", error);
    return handleUncaughtError(res, error, "Error fetching reviews");
  }
}
