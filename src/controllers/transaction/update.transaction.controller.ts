import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Transaction } from "../../models/Transaction";

import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { updateTransaction } from "../../services/transacion/update.transacion.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateTransactionController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.id) {
    return errorResponse(
      res,
      "Transaction ID is required",
      "Missing ID in request body",
      400
    );
  }

  const typedWantUpTransaction = await findByDynamicId(
    Transaction,
    { transaction_id: req.body.id },
    false
  );
  const wantUpTransaction = typedWantUpTransaction as Transaction | null;

  if (!wantUpTransaction) {
    return errorResponse(
      res,
      "Transaction Not found",
      `Transaction with ID ${req.body.id} does not exist`,
      404
    );
  }

  const updatedTransaction = await updateTransaction(req.body);

  if (!updatedTransaction) {
    console.log(
      "No valid fields to update or Transaction update failed (e.g., unauthorized or no change)"
    );
    return errorResponse(
      res,
      "Update Failed",
      "No valid fields provided for update, Transaction not found, or user unauthorized",
      400
    );
  }

  console.log("Transaction updated successfully");
  return successResponse(
    res,
    "Transaction updated successfully",
    { transaction: updatedTransaction },
    200
  );
}, "Error updating Transaction");
