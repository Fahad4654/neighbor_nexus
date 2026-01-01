import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";
import { successResponse, errorResponse } from "../../utils/apiResponse";
import {
  findAllReviews,
  findReviewByReviewId,
  findReviewsByrevieweeId,
  findReviewsByreviewerId,
  findReviewsByTransactionId,
} from "../../services/review/find.review.service";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  getPaginationParams,
  formatPaginationResponse,
} from "../../utils/pagination";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { User } from "../../models/User";

export const getReviewsByRevieweeIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const reviewee_id = req.params.id;
    const { page, pageSize, search, searchBy } = getPaginationParams(req);

    if (!reviewee_id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing review ID in route parameter",
        400
      );
    }

    const reviewsResult = await findReviewsByrevieweeId(
      reviewee_id,
      page,
      pageSize,
      search,
      searchBy
    );

    const pagination = formatPaginationResponse(reviewsResult.pagination);

    return successResponse(
      res,
      "Review fetched successfully",
      { reviews: reviewsResult.data },
      200,
      pagination
    );
  },
  "Error fetching reviews"
);

export const getReviewsByReviewerIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const reviewer_id = req.params.id;
    const { page, pageSize, search, searchBy } = getPaginationParams(req);

    if (!reviewer_id) {
      return errorResponse(
        res,
        "Reviewer ID is required",
        "Missing reviewer ID in route parameter",
        400
      );
    }
    const reviewsResult = await findReviewsByreviewerId(
      reviewer_id,
      page,
      pageSize,
      search,
      searchBy
    );

    const pagination = formatPaginationResponse(reviewsResult.pagination);

    return successResponse(
      res,
      "Review fetched successfully",
      { reviews: reviewsResult.data },
      200,
      pagination
    );
  },
  "Error fetching reviews"
);

export const getReviewsBytransactionIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction_id = req.body.transaction_id;
    const { page, pageSize, search, searchBy } = getPaginationParams(req);
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
      return errorResponse(
        res,
        "Login is required",
        "Unauthorized access",
        401
      );
    }
    const review = await findReviewsByTransactionId(
      transaction_id,
      page,
      pageSize,
      search,
      searchBy
    );
    if (!review) {
      return errorResponse(
        res,
        "Review not found",
        `Review with transaction ID ${transaction_id} does not exist`,
        404
      );
    }

    return review;
  },
  "Error fetching reviews"
);

export const getAllReviewsController = asyncHandler(
  async (req: Request, res: Response) => {
    const adminAuth = isAdmin();
    adminAuth(req, res, async () => {
      const { page, pageSize, search, searchBy } = getPaginationParams(req);
      const reviewsResult = await findAllReviews(
        page,
        pageSize,
        search,
        searchBy
      );

      const pagination = formatPaginationResponse(reviewsResult.pagination);

      return successResponse(
        res,
        "Review fetched successfully",
        { reviews: reviewsResult.data },
        200,
        pagination
      );
    });
    ("Error fetching reviews");
  }
);

export const getReviewByReviewIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const review_id = req.params.review_id;
    if (!review_id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing review ID in request body",
        400
      );
    }
    if (!req.user) {
      return errorResponse(
        res,
        "Login is required",
        "Unauthorized access",
        401
      );
    }
    const typedUser = await findByDynamicId(User, { id: req.user.id }, false);
    const user = typedUser as User;

    const review = await findReviewByReviewId(review_id, user);
    if (!review) {
      return errorResponse(
        res,
        "Review not found",
        `Review with ID ${review_id} does not exist`,
        404
      );
    }

    return review;
  },
  "Error fetching review"
);
