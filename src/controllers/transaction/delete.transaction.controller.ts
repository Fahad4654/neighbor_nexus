import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import { deleteTransaction } from "../../services/transacion/delete.transacion.service";
import { User } from "../../models/User";
import { findByDynamicId } from "../../services/global/find.service";
import { findTransactionByTransactionId } from "../../services/transacion/find.transacion.service";

export async function deleteTransactionController(req: Request, res: Response) {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(
        res,
        "Transaction ID is required",
        "Missing transaction ID in request body",
        400
      );
    }

    if (!req.user) {
      return errorResponse(
        res,
        "Login is required",
        "Unauthorized access",
        401
      );
    }

    const typedUser = await findByDynamicId(User, { id: req.user.id }, false);
    const user = typedUser as User | null;

    if (!user) {
      return errorResponse(
        res,
        "User not found",
        `User with ID ${req.user.id} does not exist`,
        404
      );
    }

    const wantDelReview = await findTransactionByTransactionId(id, user);

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
