// controllers/rentRequest/update.controller.ts

import { Request, Response } from "express";
import { findByRentRequestId } from "../../services/rentRequest/findAll.rentRequest.service";
import { updateRentRequest } from "../../services/rentRequest/update.rentRequest.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { RentRequest } from "../../models/RentRequest";

type RentRequestUpdatableField = keyof RentRequest;

const LENDER_ALLOWED_FIELDS: RentRequestUpdatableField[] = [
  "rent_status",
  "actual_pickup_time",
  "cancellation_reason",
];

const BORROWER_ALLOWED_FIELDS: RentRequestUpdatableField[] = [
  "duration_unit",
  "duration_value",
  "pickup_time",
  "drop_off_time",
  "actual_drop_off_time",
];

const ADMIN_ALLOWED_FIELDS: RentRequestUpdatableField[] = [
  "rent_status",
  "duration_unit",
  "duration_value",
  "pickup_time",
  "drop_off_time",
  "actual_pickup_time",
  "actual_drop_off_time",
  "borrower_rated",
  "lender_rated",
  "cancellation_reason",
  "borrower_rated",
  "lender_rated",
];

export async function updateRentRequestController(req: Request, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, "Unauthorized", "Login is required", 401);
    }
    const currentUserId = req.user.id;

    const validateBody = validateRequiredBody(req, res, ["rentRequest_id"]);
    if (!validateBody) return;

    const { rentRequest_id, ...updateData } = req.body;

    const rentRequest = await findByRentRequestId(rentRequest_id);
    if (!rentRequest) {
      return errorResponse(
        res,
        "Rent Request not found",
        `Rent Request with ID ${rentRequest_id} does not exist`,
        404
      );
    }

    let allowedFields: RentRequestUpdatableField[] = [];

    if (currentUserId === rentRequest.lender_id) {
      allowedFields = LENDER_ALLOWED_FIELDS;
    } else if (currentUserId === rentRequest.borrower_id) {
      if (updateData.rent_status && updateData.rent_status !== "Cancelled") {
        return errorResponse(res, "Borrowers can only cancel requests.", 403);
      }
      allowedFields = BORROWER_ALLOWED_FIELDS;
    } else if (req.user.isAdmin) {
      allowedFields = ADMIN_ALLOWED_FIELDS;
    } else {
      return errorResponse(
        res,
        "Forbidden",
        "You are not authorized to update this rental request.",
        403
      );
    }

    const updatesToSend: Partial<RentRequest> = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updatesToSend[field] = updateData[field];
      }
    }

    if (Object.keys(updatesToSend).length === 0) {
      return errorResponse(
        res,
        "Update Failed",
        "No allowed fields provided for update.",
        400
      );
    }

    const servicePayload = {
      id: rentRequest_id,
      ...updatesToSend,
    } as Partial<RentRequest> & { id: string };

    const updatedRequest = await updateRentRequest(servicePayload);

    console.log("Rent Request updated successfully", updatedRequest);
    return successResponse(
      res,
      "Rent Request updated successfully",
      { rentRequest: updatedRequest },
      200
    );
  } catch (error) {
    console.error("Error updating Rent Request:", error);
    return handleUncaughtError(res, error, "Failed to update Rent Request");
  }
}
