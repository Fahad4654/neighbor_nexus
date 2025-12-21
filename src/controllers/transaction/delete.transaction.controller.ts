import { Request, Response } from "express";
import { Review } from "../../models/Review";
import { deleteReview } from "../../services/review/delete.review.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import { findTransactionsByTransactionId } from "../../services/transacion/find.transacion.service";
import { deleteTransaction } from "../../services/transacion/delete.transacion.service";

export async function deleteTransactionController(req: Request, res: Response) {
  try {
    const { id } = req.body;
    const user = req.user;

    if (!user) {
      return errorResponse(res, "Login required", "Unauthorized access", 401);
    }

    if (!id) {
      return errorResponse(
        res,
        "Transaction ID is required",
        "Missing transaction ID in request body",
        400
      );
    }

    const wantDelReview = await findTransactionsByTransactionId(id);

    if (!wantDelReview) {
      return errorResponse(
        res,
        "Transaction not found",
        `Transaction with ID ${id} does not exist`,
        404
      );
    }

    if (
      wantDelReview.borrower_id !== user.id &&
      wantDelReview.lender_id !== user.id &&
      !user.isAdmin
    ) {
      return errorResponse(
        res,
        "Unauthorized",
        "You are not authorized to delete this transaction",
        401
      );
    }

    const deletedTransaction = await deleteTransaction(id, user.id);

    return successResponse(
      res,
      "Review deleted successfully",
      { transaction: deletedTransaction },
      200
    );
  } catch (error) {
    console.error("Error deleting review:", error);
    return handleUncaughtError(res, error, "Error deleting review");
  }
}
