import { Request, Response } from "express";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import { findAllRentRequests } from "../../services/rentRequest/findAll.rentRequest.service";

export async function getUsersRentRequestsController(
  req: Request,
  res: Response
) {
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

      return successResponse(
        res,
        "Rent Requests fetched successfully",
        rentRequests.data,
        200
      );
    } catch (error) {
      console.error("Error fetching Rent Requests:", error);
      return handleUncaughtError(res, error, "Error fetching Rent Requests");
    }
  });
}
