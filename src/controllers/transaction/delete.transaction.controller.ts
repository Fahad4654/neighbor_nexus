import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { deleteTransaction } from "../../services/transacion/delete.transacion.service";
import { User } from "../../models/User";
import { findByDynamicId } from "../../services/global/find.service";
import { findTransactionByTransactionId } from "../../services/transacion/find.transacion.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteTransactionController = asyncHandler(async (req: Request, res: Response) => {
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

  const wantDelTransaction = await findTransactionByTransactionId(id, user);

  if (!wantDelTransaction) {
    return errorResponse(
      res,
      "Transaction not found",
      `Transaction with ID ${id} does not exist`,
      404
    );
  }

  try {
    const deletedTransaction = await deleteTransaction(id, user.id);

    return successResponse(
      res,
      "Transaction deleted successfully",
      { transaction: deletedTransaction },
      200
    );
  } catch (error: any) {
    if (error.message === "Unauthorized to delete this transaction") {
      return errorResponse(res, "Forbidden", error.message, 403);
    }
    throw error;
  }
}, "Error removing transaction");
