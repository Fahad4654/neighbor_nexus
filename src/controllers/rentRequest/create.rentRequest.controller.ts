import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import {
  errorResponse,
  successResponse,
} from "../../utils/apiResponse";
import { createRentRequest } from "../../services/rentRequest/create.rentRequest.service";
import { findToolsByListingId } from "../../services/tools/find.tool.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createRentRequesController = asyncHandler(async (req: Request, res: Response) => {
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
    "duration_unit",
    "duration_value",
    "pickup_time",
  ]);
  if (!reqBodyValidation) return;

  const tool = await findToolsByListingId(req.body.listing_id);
  if (!tool) {
    return errorResponse(
      res,
      "Tool not found",
      `Tool with ID ${req.body.listing_id} does not exist`,
      404
    );
  }

  if (tool.is_available === false) {
    return errorResponse(
      res,
      "Tool not available",
      `Tool with ID ${req.body.listing_id} is not available`,
      400
    );
  }

  if (tool.owner_id === req.user?.id) {
    return errorResponse(
      res,
      "Forbidden",
      "You cannot create a Rent Request for your own tool",
      403
    );
  }

  if (tool.owner_id === req.body.borrower_id) {
    return errorResponse(
      res,
      "Forbidden",
      "You cannot create a Rent Request for a tool that you own",
      403
    );
  }

  if (req.user?.id === req.body.lender_id) {
    return errorResponse(
      res,
      "Forbidden",
      "You cannot create a Rent Request for a tool that you own",
      403
    );
  }

  if (!tool.is_approved) {
    return errorResponse(
      res,
      "Tool not approved",
      `Tool with ID ${req.body.listing_id} is not approved`,
      400
    );
  }

  const newRentRequest = await createRentRequest(req.body);

  console.log("Rent Request created successfully");
  return successResponse(
    res,
    "Rent Request created successfully",
    { rentRequest: newRentRequest },
    201
  );
}, "Error creating Rent Request");
