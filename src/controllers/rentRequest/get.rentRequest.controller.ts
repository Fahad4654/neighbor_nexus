import { Request, Response } from "express";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import {
  findAllRentRequests,
  findByBorrowerId,
  findByLenderId,
  findByListingId,
  findByRentRequestId,
  findRentRequestByBorrowerIDAndListingId,
} from "../../services/rentRequest/findAll.rentRequest.service";
import { Tool } from "../../models/Tools";
import { findByDynamicId } from "../../services/global/find.service";
import { asyncHandler } from "../../utils/asyncHandler";

// Find all Rent Requests by Admin
export async function getRentRequestsController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required for filtering/pagination");
        return errorResponse(
          res,
          "Request body is required",
          "Empty request body for required parameters",
          400
        );
      }

      // NOTE: validateRequiredBody handles its own response on failure.
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc, page = 1, pageSize = 10 } = req.body;

      const rentRequests = await findAllRentRequests(
        order,
        asc,
        Number(page),
        Number(pageSize)
      );

      const { total, ...restOfPagination } = rentRequests.pagination;
      const pagination = { totalCount: total, ...restOfPagination };

      return successResponse(
        res,
        "Rent Requests fetched successfully",
        rentRequests.data,
        200,
        pagination
      );
    } catch (error) {
      console.error("Error fetching Rent Requests:", error);
      return handleUncaughtError(res, error, "Error fetching Rent Requests");
    }
  });
}

// Find all Rent Requests by Borrower Id
export const getRentRequestByBorrowerIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  if (!req.body) {
    console.log("Request body is required for filtering/pagination");
    return errorResponse(
      res,
      "Request body is required",
      "Empty request body for required parameters",
      400
    );
  }
  const { borrower_id, order, asc, page = 1, pageSize = 10 } = req.body;

  const reqBodyValidation = validateRequiredBody(req, res, [
    "borrower_id",
    "order",
    "asc",
  ]);
  if (!reqBodyValidation) return;

  if (!req.user) {
    return errorResponse(res, "User is required", "Login is required", 401);
  }

  if (req.user.id !== borrower_id && !req.user.isAdmin) {
    return errorResponse(
      res,
      "Forbidden",
      "You are not authorized to view this Rent Request",
      403
    );
  }

  const rentRequestsResult = await findByBorrowerId(
    borrower_id,
    order,
    asc,
    Number(page),
    Number(pageSize)
  );
  const { total, ...restOfPagination } = rentRequestsResult.pagination;
  const pagination = { totalCount: total, ...restOfPagination };

  return successResponse(
    res,
    "Rent Requests fetched successfully",
    rentRequestsResult.data,
    200,
    pagination
  );
}, "Error fetching Rent Requests");

// Find all Rent Requests by Lender Id
export const getRentRequestByLenderIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  if (!req.body) {
    console.log("Request body is required for filtering/pagination");
    return errorResponse(
      res,
      "Request body is required",
      "Empty request body for required parameters",
      400
    );
  }
  const { lender_id, order, asc, page = 1, pageSize = 10 } = req.body;

  const reqBodyValidation = validateRequiredBody(req, res, [
    "lender_id",
    "order",
    "asc",
  ]);
  if (!reqBodyValidation) return;

  if (!req.user) {
    return errorResponse(res, "User is required", "Login is required", 401);
  }

  if (req.user.id !== lender_id && !req.user.isAdmin) {
    return errorResponse(
      res,
      "Forbidden",
      "You are not authorized to view this Rent Request",
      403
    );
  }

  const rentRequestsResult = await findByLenderId(
    lender_id,
    order,
    asc,
    Number(page),
    Number(pageSize)
  );
  const { total, ...restOfPagination } = rentRequestsResult.pagination;
  const pagination = { totalCount: total, ...restOfPagination };

  return successResponse(
    res,
    "Rent Requests fetched successfully",
    rentRequestsResult.data,
    200,
    pagination
  );
}, "Error fetching Rent Requests");

// Find Rent request By Listing Id
export const getRentRequestByListingIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  if (!req.body) {
    console.log("Request body is required for filtering/pagination");
    return errorResponse(
      res,
      "Request body is required",
      "Empty request body for required parameters",
      400
    );
  }
  const { listing_id, order, asc, page = 1, pageSize = 10 } = req.body;

  const reqBodyValidation = validateRequiredBody(req, res, [
    "listing_id",
    "order",
    "asc",
  ]);
  if (!reqBodyValidation) return;

  if (!req.user) {
    return errorResponse(res, "User is required", "Login is required", 401);
  }

  const typedTool = await findByDynamicId(Tool, { listing_id }, false);
  const tool = typedTool as Tool | null;

  if (!tool) {
    return errorResponse(
      res,
      "Tool not found",
      `Tool with ID ${listing_id} does not exist`,
      404
    );
  }
  if (req.user.id !== tool.owner_id && !req.user.isAdmin) {
    return errorResponse(
      res,
      "Forbidden",
      "You are not authorized to view this Rent Request",
      403
    );
  }
  const rentRequestsResult = await findByListingId(
    listing_id,
    order,
    asc,
    Number(page),
    Number(pageSize)
  );
  const { total, ...restOfPagination } = rentRequestsResult.pagination;
  const pagination = { totalCount: total, ...restOfPagination };

  return successResponse(
    res,
    "Rent Requests fetched successfully",
    rentRequestsResult.data,
    200,
    pagination
  );
}, "Error fetching Rent Requests");

// Find Rent Request By Borrower Id And Listing Id
export const getRentRequestByBorrowerAndListingIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  if (!req.body) {
    console.log("Request body is required for filtering/pagination");
    return errorResponse(
      res,
      "Request body is required",
      "Empty request body for required parameters",
      400
    );
  }
  const {
    borrower_id,
    listing_id,
    order,
    asc,
    page = 1,
    pageSize = 10,
  } = req.body;

  const reqBodyValidation = validateRequiredBody(req, res, [
    "borrower_id",
    "listing_id",
    "order",
    "asc",
  ]);
  if (!reqBodyValidation) return;

  if (!req.user) {
    return errorResponse(res, "User is required", "Login is required", 401);
  }

  const typedTool = await findByDynamicId(Tool, { listing_id }, false);
  const tool = typedTool as Tool | null;

  if (!tool) {
    return errorResponse(
      res,
      "Tool not found",
      `Tool with ID ${listing_id} does not exist`,
      404
    );
  }

  if (req.user.id !== tool.owner_id && !req.user.isAdmin) {
    return errorResponse(
      res,
      "Forbidden",
      "You are not authorized to view this Rent Request",
      403
    );
  }

  const rentRequests = await findRentRequestByBorrowerIDAndListingId(
    listing_id,
    borrower_id,
    order,
    asc,
    Number(page),
    Number(pageSize)
  );
  const { total, ...restOfPagination } = rentRequests.pagination;
  const pagination = { totalCount: total, ...restOfPagination };

  return successResponse(
    res,
    "Rent Requests fetched successfully",
    rentRequests.data,
    200,
    pagination
  );
}, "Error fetching Rent Requests");

export const getByRentRequestIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  if (!id) {
    console.log("Request body is required for filtering/pagination");
    return errorResponse(
      res,
      "Request body is required",
      "Empty request body for required parameters",
      400
    );
  }

  if (!req.user) {
    return errorResponse(res, "User is required", "Login is required", 401);
  }

  const rentRequest = await findByRentRequestId(id);
  if (!rentRequest) {
    return errorResponse(
      res,
      "Rent Request not found",
      `Rent Request with ID ${id} does not exist`,
      404
    );
  }
  if (
    req.user.id !== rentRequest.borrower_id &&
    !req.user.isAdmin &&
    req.user.id !== rentRequest.lender_id
  ) {
    return errorResponse(
      res,
      "Forbidden",
      "You are not authorized to view this Rent Request",
      403
    );
  }
  return successResponse(
    res,
    "Rent Request fetched successfully",
    rentRequest,
    200
  );
}, "Error fetching Rent Request");
