// controllers/rentRequest/update.controller.ts

import { Request, Response } from "express";
import { findByRentRequestId } from "../../services/rentRequest/findAll.rentRequest.service";
import { updateRentRequest } from "../../services/rentRequest/update.rentRequest.service";
import {
  errorResponse,
  successResponse,
} from "../../utils/apiResponse";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { createTransaction } from "../../services/transacion/create.transacion.service";
import { COMMISSION } from "../../config";
import { findTransactionsByRentRequestId } from "../../services/transacion/find.transacion.service";
import { findByDynamicId } from "../../services/global/find.service";
import { User } from "../../models/User";
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

export const updateRentRequestController = asyncHandler(async (req: Request, res: Response) => {
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

  let userIslender = false;

  if (currentUserId === rentRequest.lender_id) {
    allowedFields = LENDER_ALLOWED_FIELDS;
    userIslender = true;
  } else if (currentUserId === rentRequest.borrower_id) {
    userIslender = false;
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
  if (req.body.pickup_time) {
    if (typeof req.body.pickup_time === "string") {
      req.body.pickup_time = new Date(req.body.pickup_time);
    }
    if (req.body.pickup_time < new Date()) {
      return errorResponse(
        res,
        "Update Failed",
        "Pickup time cannot be in the past.",
        400
      );
    }
  }

  const servicePayload = {
    id: rentRequest_id,
    ...updatesToSend,
  } as Partial<RentRequest> & { id: string };

  if (
    rentRequest.rent_status === "Approved" ||
    rentRequest.rent_status === "Cancelled"
  ) {
    console.log("Cannot update an approved or cancelled request.");
    return errorResponse(
      res,
      "Update Failed",
      "Cannot update an approved or cancelled request.",
      400
    );
  }

  const typedUser = await findByDynamicId(User, { id: currentUserId }, false);
  const user = typedUser as User | null;
  if (!user) {
    console.log("User not found");
    return errorResponse(
      res,
      "User not found",
      `User with ID ${currentUserId} does not exist`,
      404
    );
  }

  const checkTransaction = await findTransactionsByRentRequestId(
    rentRequest_id,
    user
  );
  if (checkTransaction.length > 0) {
    console.log("Transaction already exists");
    return errorResponse(
      res,
      "Transaction already exists",
      "Transaction already exists",
      400
    );
  }

  const updatedRentRequest = await updateRentRequest(servicePayload);
  const tool = await Tool.findByPk(updatedRentRequest?.listing_id);
  if (!tool) {
    console.log("Tool not found");
    return errorResponse(
      res,
      "Tool not found",
      `Tool with ID ${updatedRentRequest?.listing_id} does not exist`,
      404
    );
  }
  let transaction = null;
  if (
    updatedRentRequest &&
    currentUserId === updatedRentRequest.lender_id &&
    updatedRentRequest.rent_status === "Approved"
  ) {
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

  console.log("Rent Request updated successfully");
  return successResponse(
    res,
    "Rent Request updated successfully",
    { rentRequest: updatedRentRequest, transaction },
    200
  );
}, "Failed to update Rent Request");
