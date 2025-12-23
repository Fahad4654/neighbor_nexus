import { Request, Response } from "express";
import { User } from "../../models/User";
import { Op } from "sequelize";
import { ADMIN_USERNAME } from "../../config";
import { deleteUser } from "../../services/user/delete.user.service";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteUserController = asyncHandler(async (req: Request, res: Response) => {
  const { email, id, phoneNumber } = req.body;

  if (!email && !id && !phoneNumber) {
    return errorResponse(
      res,
      "Provide email, id, or phoneNumber",
      "Missing user identifier for deletion",
      400
    );
  }

  const whereClause: any = {
    [Op.or]: [
      id ? { id } : null,
      email ? { email } : null,
      phoneNumber ? { phoneNumber } : null,
    ].filter(Boolean),
  };

  const wantDelUser = await User.findOne({ where: whereClause });
  if (!wantDelUser) {
    return errorResponse(
      res,
      "User not found or identifiers mismatch",
      "User lookup failed",
      404
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

  if (!req.user.isAdmin) {
    if (
      req.user.id !== wantDelUser.id &&
      wantDelUser.createdBy !== req.user.id
    ) {
      return errorResponse(
        res,
        "Forbidden",
        "You are not permitted to delete this user",
        403
      );
    }
  }

  if (wantDelUser.username === ADMIN_USERNAME) {
    console.log("Cannot delete main admin user");
    return errorResponse(
      res,
      "Forbidden",
      "Cannot delete main admin user",
      403
    );
  }

  const deletedCount = await deleteUser({ email, id, phoneNumber });

  if (deletedCount === 0) {
    return errorResponse(
      res,
      "User not found",
      "Deletion failed (user not found after lookup or deletion restricted)",
      404
    );
  }

  return successResponse(
    res,
    "User deleted successfully",
    { deletedUser: { email, id, phoneNumber } },
    200
  );
}, "Error deleting user");
