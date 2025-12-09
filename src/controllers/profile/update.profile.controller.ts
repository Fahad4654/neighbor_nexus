import { Request, Response } from "express";
import { updateProfileByUserId } from "../../services/profile/update.profile.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function updateUserProfileController(req: Request, res: Response) {
  try {
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
        "You are not authorized to update this profile",
        403
      );
    }

    const updatedProfile = await updateProfileByUserId(
      req.body.userId,
      req.body
    );

    if (!updatedProfile) {
      console.log("No valid fields provided for update or profile not found");
      return errorResponse(
        res,
        "Update Failed",
        "No valid fields provided for update or profile not found",
        400
      );
    }

    console.log("Profile updated successfully", updatedProfile);
    return successResponse(
      res,
      "Profile updated successfully",
      { profile: updatedProfile },
      200
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return handleUncaughtError(res, error, "Failed to update profile");
  }
}
