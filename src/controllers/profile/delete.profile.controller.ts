import { Request, Response } from "express";
import { deleteProfileByUserId } from "../../services/profile/delete.profile.service";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body || !req.body.userId) {
      console.log("UserId is required");
      return errorResponse(
        res,
        "UserId is required",
        "Missing userId in request body",
        400
      );
    }

    if (!req.user) {
      console.log("Unauthorized access attempt");
      return errorResponse(res, "Unauthorized", "Login is required", 401);
    }

    if (!req.user.isAdmin && req.user.id !== req.body.userId) {
      console.log("Forbidden access attempt");
      return errorResponse(
        res,
        "Forbidden",
        "You are not authorized to delete this profile",
        403
      );
    }

    const { deletedCount, user } = await deleteProfileByUserId(req.body.userId);

    if (deletedCount === 0) {
      const message = `User: ${user?.username} doesn't have a profile`;
      console.log(message);
      return errorResponse(res, "User's Profile not found", message, 404);
    }

    const message = `User: ${user?.username}'s profile deleted successfully`;
    console.log(message);
    return successResponse(
      res,
      message,
      { email: user?.email, deletedCount },
      200
    );
  },
  "Error deleting user profile"
);
