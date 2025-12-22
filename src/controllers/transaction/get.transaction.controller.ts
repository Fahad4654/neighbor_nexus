import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import {
  findTransactionByTransactionId,
  findTransactionsByLenderId,
} from "../../services/transacion/find.transacion.service";
import { findByDynamicId } from "../../services/global/find.service";
import { User } from "../../models/User";

export async function getTransactionsByBorrowerIdController(
  req: Request,
  res: Response
) {
  try {
    const borrower_id = req.params.id;
    const { page, pageSize } = req.body;

    if (!borrower_id) {
      return errorResponse(
        res,
        "borrower_id is required",
        "Missing borrower ID in route parameter",
        400
      );
    }
    const transacions = await findTransactionsByLenderId(
      borrower_id,
      page,
      pageSize
    );

    if (!transacions) {
      console.log("Transacion not found");
      return errorResponse(
        res,
        "Transacion not found",
        `Borrower does not have any transacions`,
        404
      );
    }

    return successResponse(
      res,
      "Transacions fetched successfully",
      transacions,
      200
    );
  } catch (error) {
    console.error("Error finding transacions:", error);
    return handleUncaughtError(res, error, "Error fetching transacions");
  }
}

export async function getTransactionsBylenderIdController(
  req: Request,
  res: Response
) {
  try {
    const lender_id = req.params.id;
    const { page, pageSize } = req.body;

    if (!lender_id) {
      return errorResponse(
        res,
        "lender_id is required",
        "Missing lender ID in route parameter",
        400
      );
    }
    const transacions = await findTransactionsByLenderId(
      lender_id,
      page,
      pageSize
    );

    if (!transacions) {
      console.log("Transacion not found");
      return errorResponse(
        res,
        "Transacion not found",
        `Lender does not have any transacions`,
        404
      );
    }

    return successResponse(
      res,
      "Transacions fetched successfully",
      transacions,
      200
    );
  } catch (error) {
    console.error("Error finding transacions:", error);
    return handleUncaughtError(res, error, "Error fetching transacions");
  }
}

export async function getTransactionBytransactionIdController(
  req: Request,
  res: Response
) {
  const transaction_id = req.params.id;
  if (!transaction_id) {
    return errorResponse(
      res,
      "Transaction ID is required",
      "Missing transaction ID in request body",
      400
    );
  }
  if (!req.user) {
    return errorResponse(res, "Login is required", "Unauthorized access", 401);
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

  const transacion = await findTransactionByTransactionId(transaction_id, user);
  if (!transacion) {
    return errorResponse(
      res,
      "Transacion not found",
      `Transacion with transaction ID ${transaction_id} does not exist`,
      404
    );
  }

  return transacion;
}
