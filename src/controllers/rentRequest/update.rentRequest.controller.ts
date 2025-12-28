import { Request, Response } from "express";
import { findByRentRequestId } from "../../services/rentRequest/findAll.rentRequest.service";
import { updateRentRequest } from "../../services/rentRequest/update.rentRequest.service";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { createTransaction } from "../../services/transacion/create.transacion.service";
import { COMMISSION } from "../../config";
import { findTransactionsByRentRequestId } from "../../services/transacion/find.transacion.service";
import { asyncHandler } from "../../utils/asyncHandler";

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
  "actual_drop_off_time",
  "rent_status",
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
];

export const updateRentRequestController = asyncHandler(async (req: Request, res: Response) => {
  // 1. Authentication Check
  if (!req.user || !req.user.id) {
    return errorResponse(res, "Unauthorized", "Login is required", 401);
  }
  const currentUserId = req.user.id;

  // 2. Validate Required ID
  const validateBody = validateRequiredBody(req, res, ["rentRequest_id"]);
  if (!validateBody) return;

  const { rentRequest_id, ...updateData } = req.body;

  // 3. Fetch Existing Request
  const rentRequest = await findByRentRequestId(rentRequest_id);
  if (!rentRequest) {
    return errorResponse(res, "Rent Request not found", `ID ${rentRequest_id} does not exist`, 404);
  }

  // 4. Role-Based Permission Logic
  let allowedFields: RentRequestUpdatableField[] = [];

  if (currentUserId === rentRequest.lender_id) {
    allowedFields = LENDER_ALLOWED_FIELDS;
  } else if (currentUserId === rentRequest.borrower_id) {
    // Security: Borrowers can change status ONLY to "Cancelled"
    if (updateData.rent_status && updateData.rent_status !== "Cancelled") {
      return errorResponse(res, "Forbidden", "Borrowers can only cancel requests.", 403);
    }
    allowedFields = BORROWER_ALLOWED_FIELDS;
  } else if (req.user.isAdmin) {
    allowedFields = ADMIN_ALLOWED_FIELDS;
  } else {
    return errorResponse(res, "Forbidden", "You are not authorized to update this request.", 403);
  }

  // 5. Sanitize Updates based on Allowed Fields
  const updatesToSend: any = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updatesToSend[field] = updateData[field];
    }
  }

  if (Object.keys(updatesToSend).length === 0) {
    return errorResponse(res, "Update Failed", "No valid/allowed fields provided.", 400);
  }

  // 6. Specific Validation: Pickup Time
  if (updatesToSend.pickup_time) {
    const pDate = new Date(updatesToSend.pickup_time);
    if (isNaN(pDate.getTime())) {
      return errorResponse(res, "Invalid Date", "Pickup time format is invalid.", 400);
    }
    if (pDate < new Date()) {
      return errorResponse(res, "Update Failed", "Pickup time cannot be in the past.", 400);
    }
    updatesToSend.pickup_time = pDate;
  }

  // 7. Prevent modifications after final states (except for specific tracking fields)
  const isFinalState = rentRequest.rent_status === "Approved" || rentRequest.rent_status === "Cancelled";
  const isUpdatingTracking = updatesToSend.actual_pickup_time || updatesToSend.actual_drop_off_time;

  if (isFinalState && !isUpdatingTracking && !req.user.isAdmin) {
    return errorResponse(res, "Update Failed", "Cannot modify an approved or cancelled request.", 400);
  }

  // 8. Transaction Guard: Only check if the status is moving TO "Approved"
  if (updatesToSend.rent_status === "Approved") {
    const existingTransactions = await findTransactionsByRentRequestId(rentRequest_id, req.user as any);
    if (existingTransactions.length > 0) {
      return errorResponse(res, "Conflict", "A transaction already exists for this rent request.", 400);
    }
  }

  // 9. Execute the Service Update
  const updatedRentRequest = await updateRentRequest({
    id: rentRequest_id,
    ...updatesToSend,
  });

  // 10. Automated Transaction Creation
  let transaction = null;
  // Trigger transaction ONLY if the status was just changed to "Approved" by someone other than the borrower
  if (
    updatedRentRequest &&
    updatesToSend.rent_status === "Approved" &&
    currentUserId !== updatedRentRequest.borrower_id
  ) {
    const tool = await Tool.findByPk(updatedRentRequest.listing_id);
    if (!tool) throw new Error("Tool not found during transaction creation");

    transaction = await createTransaction(
      updatedRentRequest.listing_id,
      updatedRentRequest.borrower_id,
      updatedRentRequest.lender_id,
      updatedRentRequest.id,
      updatedRentRequest.pickup_time,
      updatedRentRequest.drop_off_time,
      updatedRentRequest.rental_price,
      Number(updatedRentRequest.rental_price) * (COMMISSION / 100),
      Number(tool.security_deposit),
      "",
      "Pending"
    );
  }

  return successResponse(
    res,
    "Rent Request updated successfully",
    { rentRequest: updatedRentRequest, transaction },
    200
  );
}, "Failed to update Rent Request");