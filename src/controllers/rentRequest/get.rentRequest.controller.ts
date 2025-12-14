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
} from "../../services/rentRequest/findAll.rentRequest.service";

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

export async function getRentRequestByBorrowerIdController(
  req: Request,
  res: Response
) {
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

    const [rentRequestsResult] = await findByBorrowerId(
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
  } catch (error) {
    console.error("Error fetching Rent Requests:", error);
    return handleUncaughtError(res, error, "Error fetching Rent Requests");
  }
}

export async function getRentRequestByLenderIdController(
  req: Request,
  res: Response
) {
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

    const [rentRequestsResult] = await findByBorrowerId(
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
  } catch (error) {
    console.error("Error fetching Rent Requests:", error);
    return handleUncaughtError(res, error, "Error fetching Rent Requests");
  }
}
