import { Request, Response } from "express";
import { User } from "../../models/User";
import { findByDynamicId } from "../../services/global/find.service";
import { updateUser } from "../../services/user/update.user.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function updateUserController(req: Request, res: Response) {
  try {
    if (!req.body.id) {
      return errorResponse(
        res,
        "User ID is required",
        "Missing ID in request body",
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

    const typedWantUpUser = await findByDynamicId(
      User,
      { id: req.body.id },
      false
    );
    const wantUpUser = typedWantUpUser as User | null;

    if (!wantUpUser) {
      return errorResponse(
        res,
        "User Not found",
        `User with ID ${req.body.id} does not exist`,
        404
      );
    }

    if (!req.user.isAdmin) {
      if (req.user.id !== req.body.id && wantUpUser.createdBy !== req.user.id) {
        return errorResponse(
          res,
          "Forbidden",
          "You are not permitted to update this user",
          403
        );
      }
    }

    if (req.body.isAdmin && !req.user.isAdmin) {
      return errorResponse(
        res,
        "Forbidden",
        "Only admins can grant admin privileges",
        403
      );
    }

    if (req.body.isVerified && !req.user.isAdmin) {
      return errorResponse(
        res,
        "Forbidden",
        "Only admins can verify user accounts",
        403
      );
    }

    const updatedUser = await updateUser(req.body);

    if (!updatedUser) {
      console.log("No valid fields to update or user not found");
      return errorResponse(
        res,
        "Update Failed",
        "No valid fields to update or user not found after update attempt",
        400
      );
    }

    console.log("User updated successfully", updatedUser);
    return successResponse(
      res,
      "User updated successfully",
      { user: updatedUser },
      200
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return handleUncaughtError(res, error, "Error updating user");
  }
}
