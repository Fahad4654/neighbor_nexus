import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import { createTransaction } from "../../services/transacion/create.transacion.service";

export async function createTransactionController(req: Request, res: Response) {
  try {
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
  } catch (error) {
    console.error("Error creating transaction:", error);
    return handleUncaughtError(res, error, "Error creating transaction");
  }
}
