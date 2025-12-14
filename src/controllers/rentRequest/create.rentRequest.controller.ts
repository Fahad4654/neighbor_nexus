import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import { createRentRequest } from "../../services/rentRequest/create.rentRequest.service";
export async function createUserRentRequesController(
  req: Request,
  res: Response
) {
  try {
    if (!req.body) {
      console.log("Request body is required");
      return errorResponse(
        res,
        "Request body is required",
        "Empty request body",
        400
      );
    }

    if (req.user?.isAdmin) {
      console.log("Admin cannot create a Rent Request");
      return errorResponse(
        res,
        "Forbidden",
        "Admin cannot create a Rent Request",
        403
      );
    }

    // NOTE: validateRequiredBody handles its own response on failure, so we skip here
    const reqBodyValidation = validateRequiredBody(req, res, [
      "listing_id",
      "borrower_id",
      "lender_id",
      "duration_unit",
      "duration_value",
      "pickup_time",
      "drop_off_time",
      "rental_price",
    ]);
    if (!reqBodyValidation) return;

    const newRentRequest = await createRentRequest(req.body);

    console.log("Rent Request created successfully", newRentRequest);
    return successResponse(
      res,
      "Rent Request created successfully",
      { rentRequest: newRentRequest },
      201
    );
  } catch (error) {
    console.error("Error creating Rent Request:", error);
    return handleUncaughtError(res, error, "Error creating Rent Request");
  }
}
