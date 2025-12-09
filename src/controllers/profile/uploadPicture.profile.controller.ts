import { Request, Response } from "express";
import { saveFile } from "../../middlewares/upload";
import { updateProfileByUserId } from "../../services/profile/update.profile.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function uploadProfilePictureController(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      return errorResponse(res, "No file uploaded", "Missing file attachment", 400);
    }

    if (!req.body.userId) {
      return errorResponse(res, "userId is required", "Missing userId in request body", 400);
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
        "You are not authorized to update this profile picture",
        403
      );
    }

    // create a temporary avatarUrl but DO NOT write the file
    const tempAvatarUrl = `/media/profile/temp-${Date.now()}.jpg`;

    const updatedProfile = await updateProfileByUserId(req.body.userId, {
      avatarUrl: tempAvatarUrl, // temp placeholder
    });

    if (!updatedProfile) {
      return errorResponse(
        res,
        "Profile not found or update failed",
        "Could not find profile for the given userId",
        404
      );
    }

    const finalAvatarUrl = saveFile(
      req.user.id,
      req.file.buffer,
      "profile",
      req.file.originalname
    );

    // Update profile again with actual URL
    const profile = await updateProfileByUserId(req.body.userId, {
      avatarUrl: finalAvatarUrl,
    });

    return successResponse(
      res,
      "Profile picture uploaded successfully",
      { profile: profile },
      200
    );
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return handleUncaughtError(res, error, "Failed to upload profile picture");
  }
}