import { Request, Response } from "express";
import { User } from "../../models/User";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { createTransaction } from "../../services/transacion/create.transacion.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createTransactionController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, "Authentication required", "Login is required", 401);
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return errorResponse(res, "User not found", "User ID in token is invalid", 404);
  }

  if (!user.isAdmin) {
    return errorResponse(res, "Admin access required", "Not authorized", 403);
  }

  const reqBodyValidation = validateRequiredBody(req, res, [
    "listing_id",
    "borrower_id",
    "lender_id",
    "rent_request_id",
    "start_time",
    "end_time",
    "total_fee",
    "platform_commission",
    "deposit_amount",
    "stripe_charge_id",
  ]);
  if (!reqBodyValidation) return;

  const {
    listing_id,
    borrower_id,
    lender_id,
    rent_request_id,
    start_time,
    end_time,
    total_fee,
    platform_commission,
    deposit_amount,
    stripe_charge_id,
  } = req.body;

  const newTransaction = await createTransaction(
    listing_id,
    borrower_id,
    lender_id,
    rent_request_id,
    start_time,
    end_time,
    total_fee,
    platform_commission,
    deposit_amount,
    stripe_charge_id,
    "Pending"
  );

  if (!newTransaction) {
    console.log("Failed to create transaction");
    return errorResponse(
      res,
      "Failed to create transaction",
      "transaction service returned null (e.g., failed validation or DB error)",
      400
    );
  }

  return successResponse(
    res,
    "transaction created successfully",
    { transaction: newTransaction },
    201
  );
}, "Error creating transaction");
