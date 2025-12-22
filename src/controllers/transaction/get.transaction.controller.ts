import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import {
  findTransactionsByLenderId,
  findTransactionsByTransactionId,
} from "../../services/transacion/find.transacion.service";

export async function getTransactionByBorrowerIdController(
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

export async function getTransactionBylenderIdController(
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
  const transaction_id = req.body.transaction_id;
  const user = req.user;
  if (!transaction_id) {
    return errorResponse(
      res,
      "Transaction ID is required",
      "Missing transaction ID in request body",
      400
    );
  }
  if (!user) {
    return errorResponse(res, "Login is required", "Unauthorized access", 401);
  }
  const transacion = await findTransactionsByTransactionId(transaction_id);
  if (!transacion) {
    return errorResponse(
      res,
      "Review not found",
      `Review with transaction ID ${transaction_id} does not exist`,
      404
    );
  }

  return transacion;
}
