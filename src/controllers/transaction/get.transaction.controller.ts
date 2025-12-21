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
        "Reviewer ID is required",
        "Missing reviewer ID in route parameter",
        400
      );
    }
    const transacion = await findTransactionsByLenderId(
      lender_id,
      page,
      pageSize
    );

    if (!transacion) {
      console.log("Review not found");
      return errorResponse(
        res,
        "Review not found",
        `Review with ID ${lender_id} does not exist`,
        404
      );
    }

    return successResponse(res, "Review fetched successfully", transacion, 200);
  } catch (error) {
    console.error("Error finding review:", error);
    return handleUncaughtError(res, error, "Error fetching reviews");
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
