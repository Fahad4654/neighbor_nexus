import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import {
  findReviewsByReviewerId,
  findReviewsByTransactionId,
} from "../../services/review/find.review.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPaginationParams, formatPaginationResponse } from "../../utils/pagination";

export const getReviewsByIdController = asyncHandler(async (req: Request, res: Response) => {
  const review_id = req.params.id;

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
}, "Error fetching reviews");

export const getReviewsByReviewerIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const reviewer_id = req.params.id;
  const { page, pageSize, search } = getPaginationParams(req);

  if (!reviewer_id) {
    return errorResponse(
      res,
      "Reviewer ID is required",
      "Missing reviewer ID in route parameter",
      400
    );
  }
  const reviewsResult = await findReviewsByReviewerId(
    reviewer_id,
    page,
    pageSize,
    search
  );

  const pagination = formatPaginationResponse(reviewsResult.pagination);

  return successResponse(
    res,
    "Review fetched successfully",
    reviewsResult.data,
    200,
    pagination
  );
}, "Error fetching reviews");

export const getReviewsBytransactionIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const transaction_id = req.body.transaction_id;
  const { search } = getPaginationParams(req);
  const user = req.user;
  if (!transaction_id) {
    return errorResponse(
      res,
      "Transaction ID is required",
      "Missing transaction ID in request body",
      400
    );
  }
  if (!user) {
    return errorResponse(res, "Login is required", "Unauthorized access", 401);
  }
  const review = await findReviewsByTransactionId(transaction_id, search);
  if (!review) {
    return errorResponse(
      res,
      "Review not found",
      `Review with transaction ID ${transaction_id} does not exist`,
      404
    );
  }

  return review;
}, "Error fetching reviews");
