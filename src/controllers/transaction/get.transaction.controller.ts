import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import {
  findTransactionByTransactionId,
  findTransactionsByBorrowerId,
  findTransactionsByLenderId,
  findTransactionsByListingId,
  findTransactionsByRentRequestId,
  findTransactionsByUserId,
} from "../../services/transacion/find.transacion.service";
import { findByDynamicId } from "../../services/global/find.service";
import { User } from "../../models/User";
import { Tool } from "../../models/Tools";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPaginationParams, formatPaginationResponse } from "../../utils/pagination";
import { validateAuth, validateAuthorization, validateId } from "../../utils/validation";

export const getTransactionsByBorrowerIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const borrower_id = req.params.id;
  const { order, asc, page, pageSize, search, searchBy } = getPaginationParams(req);

  if (!validateRequiredBody(req, res, ["order", "asc"])) return;
  if (!validateAuth(req.user, res)) return;

  if (!validateId(borrower_id, "borrower_id", res, "route parameter")) return;
  
  if (!validateAuthorization(req.user, borrower_id, res, "Unauthorized access")) return;
  const transacions = await findTransactionsByBorrowerId(
    borrower_id,
    order,
    asc,
    page,
    pageSize,
    search,
    searchBy
  );

  const pagination = formatPaginationResponse(transacions.pagination);

  return successResponse(
    res,
    "Transacions fetched successfully",
    transacions.data,
    200,
    pagination
  );
}, "Error fetching transacions");

export const getTransactionsBylenderIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const lender_id = req.params.id;
  const { order, asc, page, pageSize, search, searchBy } = getPaginationParams(req);

  if (!validateRequiredBody(req, res, ["order", "asc"])) return;
  if (!validateAuth(req.user, res)) return;

  if (!validateId(lender_id, "lender_id", res, "route parameter")) return;

  if (!validateAuthorization(req.user, lender_id, res, "Unauthorized access")) return;

  const transacions = await findTransactionsByLenderId(
    lender_id,
    order,
    asc,
    page,
    pageSize,
    search,
    searchBy
  );

  const pagination = formatPaginationResponse(transacions.pagination);

  return successResponse(
    res,
    "Transacions fetched successfully",
    transacions.data,
    200,
    pagination
  );
}, "Error fetching transacions");

export const getTransactionBytransactionIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const transaction_id = req.params.id;
  if (!transaction_id) {
    return errorResponse(
      res,
      "Transaction ID is required",
      "Missing transaction ID in request body",
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
  const user = typedUser as User | null;

  if (!user) {
    return errorResponse(
      res,
      "User not found",
      `User with ID ${req.user.id} does not exist`,
      402
    );
  }

  const transacion = await findTransactionByTransactionId(
    transaction_id,
    user
  );
  if (!transacion) {
    return errorResponse(
      res,
      "Transacion not found",
      `Transacion with transaction ID ${transaction_id} does not exist`,
      404
    );
  }

  return successResponse(
    res,
    "Transacion fetched successfully",
    transacion,
    200
  );
}, "Error fetching transacions");

export const getTransactionsByListingIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const listing_id = req.params.id;
  const { order, asc, page, pageSize, search, searchBy } = getPaginationParams(req);

  const reqBodyValidation = validateRequiredBody(req, res, ["order", "asc"]);
  if (!reqBodyValidation) return;
  if (!listing_id) {
    return errorResponse(
      res,
      "Listing ID is required",
      "Missing listing ID in request body",
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

  const user = req.user;
  if (!user) {
    return errorResponse(
      res,
      "User not found",
      `User with ID ${req.user.id} does not exist`,
      404
    );
  }
  const typedTool = await findByDynamicId(Tool, { listing_id }, false);
  const tool = typedTool as Tool | null;

  if (!tool) {
    return errorResponse(
      res,
      "Tool not found",
      `Tool with listing ID ${listing_id} does not exist`,
      404
    );
  }

  if (tool.owner_id !== user.id) {
    return errorResponse(
      res,
      "Unauthorized access",
      `You are not the owner of this tool`,
      401
    );
  }

  const transacions = await findTransactionsByListingId(
    listing_id,
    order,
    asc,
    page,
    pageSize,
    search,
    searchBy
  );
  const pagination = formatPaginationResponse(transacions.pagination);

  return successResponse(
    res,
    "Transacions fetched successfully",
    transacions.data,
    200,
    pagination
  );
}, "Error fetching transacions");

export const getTransactionByRentRequest = asyncHandler(async (req: Request, res: Response) => {
  const rent_request_id = req.params.id;

  if (!rent_request_id) {
    return errorResponse(
      res,
      "Rent request ID is required",
      "Missing ID in params",
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

  // 1. Get the user (using the ID from the auth middleware)
  const typedUser = await findByDynamicId(User, { id: req.user.id }, false);
  const user = typedUser as User | null;
  const { search, searchBy } = getPaginationParams(req);

  if (!user) {
    return errorResponse(res, "User not found", "User does not exist", 404);
  }

  // 2. Fetch the transactions
  const transactions = await findTransactionsByRentRequestId(
    rent_request_id,
    user,
    search,
    searchBy
  );

  // 3. Check if any transactions were found (check array length)
  if (!transactions || transactions.length === 0) {
    return errorResponse(
      res,
      "Transaction not found",
      `No visible transactions for rent request ${rent_request_id}`,
      404
    );
  }

  // 4. Return success response (Don't just return the data, use successResponse)
  return successResponse(
    res,
    "Transaction retrieved successfully",
    { transactions },
    200
  );
}, "Error fetching transaction");

export const getTransactionsByUserIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const user_id = req.params.id;
  const { order, asc, page, pageSize, search, searchBy } = getPaginationParams(req);

  const reqBodyValidation = validateRequiredBody(req, res, ["order", "asc"]);
  if (!reqBodyValidation) return;
  if (!user_id) {
    return errorResponse(
      res,
      "User ID is required",
      "Missing user ID in request body",
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

  const user = req.user;
  if (!user) {
    return errorResponse(
      res,
      "User not found",
      `User with ID ${req.user.id} does not exist`,
      404
    );
  }

  const transacions = await findTransactionsByUserId(
    user_id,
    order,
    asc,
    page,
    pageSize,
    search,
    searchBy
  );
  const pagination = formatPaginationResponse(transacions.pagination);

  return successResponse(
    res,
    "Transacions fetched successfully",
    transacions.data,
    200,
    pagination
  );
}, "Error fetching transacions");
