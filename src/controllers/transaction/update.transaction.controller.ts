import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Transaction } from "../../models/Transaction";
import { updateTransaction } from "../../services/Transaction/update.Transaction.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function updateTransactionController(req: Request, res: Response) {
  try {
    if (!req.body.id) {
      return errorResponse(
        res,
        "Review ID is required",
        "Missing ID in request body",
        400
      );
    }

    const typedWantUpTransaction = await findByDynamicId(
      Transaction,
      { id: req.body.id },
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
      { Transaction: updatedTransaction },
      200
    );
  } catch (error) {
    console.error("Error updating Transaction:", error);
    return handleUncaughtError(res, error, "Error updating Transaction");
  }
}
