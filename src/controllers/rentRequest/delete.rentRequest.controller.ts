import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { deleteRentRequest } from "../../services/rentRequest/delete.rentRequest.service";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { findByDynamicId } from "../../services/global/find.service";
import { User } from "../../models/User";
import { asyncHandler } from "../../utils/asyncHandler";
import { RentRequest } from "../../models/RentRequest";

export const deleteRentRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body) {
      console.log("Request body is required");
      return errorResponse(
        res,
        "Request body is required",
        "Empty request body",
        400
      );
    }

    if (!req.user) {
      console.log("Unauthorized access attempt");
      return errorResponse(res, "Unauthorized", "Login is required", 401);
    }
    const typedUser = await findByDynamicId(User, { id: req.user.id }, false);
    const user = typedUser as User | null;

    if (!user) {
      console.log("User not found");
      return errorResponse(
        res,
        "User not found",
        `User with ID ${req.user.id} does not exist`,
        404
      );
    }

    const validateBody = validateRequiredBody(req, res, ["rentRequest_id"]);
    if (!validateBody) return;

    const deletedRentRequest = await deleteRentRequest(
      req.body.rentRequest_id,
      user
    );

    if (!deletedRentRequest) {
      console.log(`Rent Request with ID ${req.body.rentRequest_id} not found`);
      return errorResponse(
        res,
        "Rent Request not found",
        `Rent Request with ID ${req.body.rentRequest_id} does not exist`,
        404
      );
    }

    console.log("Rent Request deleted successfully");
    return successResponse(
      res,
      "Rent Request deleted successfully",
      { rentRequest: deletedRentRequest },
      200
    );
  },
  "Error deleting rent request"
);
