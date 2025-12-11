import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import {
  findReviewsByReviewerId,
  findReviewsByTransactionId,
} from "../../services/review/find.review.service";

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
      review.dataValues,
      200
    );
  } catch (error) {
    console.error("Error finding review:", error);
    return handleUncaughtError(res, error, "Error fetching reviews");
  }
}

export async function getReviewsByReviewerIdController(
  req: Request,
  res: Response
) {
  try {
    const reviewer_id = req.params.id;
    console.log("Reviewer ID:", reviewer_id);
    const { page, pageSize } = req.body;

    if (!reviewer_id) {
      return errorResponse(
        res,
        "Reviewer ID is required",
        "Missing reviewer ID in route parameter",
        400
      );
    }
    const review = await findReviewsByReviewerId(reviewer_id, page, pageSize);
    console.log(review);

    if (!review) {
      console.log("Review not found");
      return errorResponse(
        res,
        "Review not found",
        `Review with ID ${reviewer_id} does not exist`,
        404
      );
    }

    return successResponse(res, "Review fetched successfully", review, 200);
  } catch (error) {
    console.error("Error finding review:", error);
    return handleUncaughtError(res, error, "Error fetching reviews");
  }
}

export async function getReviewsBytransactionIdController(
  req: Request,
  res: Response
) {
  const transaction_id = req.body.transaction_id;
  if (!transaction_id) {
    return errorResponse(
      res,
      "Transaction ID is required",
      "Missing transaction ID in request body",
      400
    );
  }
  const review = await findReviewsByTransactionId(transaction_id);
  return review;
}
