import { Request, Response } from "express";
import { User } from "../../models/User";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { createProfile } from "../../services/profile/create.profile.service";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return errorResponse(
        res,
        "Authentication required",
        "Login is required",
        401
      );
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(
        res,
        "User not found",
        "User ID in token is invalid",
        404
      );
    }

    if (!user.isAdmin) {
      return errorResponse(res, "Admin access required", "Not authorized", 403);
    }

    if (!req.body) {
      console.log("Request body is required");
      return errorResponse(
        res,
        "Request body is required",
        "Empty request body",
        400
      );
    }

    // NOTE: validateRequiredBody handles its own response on failure, so we skip here
    const reqBodyValidation = validateRequiredBody(req, res, [
      "userId",
      "bio",
      "avatarUrl",
      "address",
    ]);
    if (!reqBodyValidation) return;

    const newProfile = await createProfile(req.body);

    console.log("User profile created successfully");
    return successResponse(
      res,
      "User profile created successfully",
      { profile: newProfile },
      201
    );
  },
  "Error creating user profile"
);
