import { Request, Response } from "express";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { createProfile } from "../../services/profile/create.profile.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
export async function createUserProfileController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        // 🔴 400 Bad Request
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

      console.log("User profile created successfully", newProfile);
      // 🟢 201 Created
      return successResponse(
        res,
        "User profile created successfully",
        { profile: newProfile },
        201
      );
    } catch (error) {
      console.error("Error creating user profile:", error);
      // 🛑 500 Internal Server Error
      return handleUncaughtError(res, error, "Error creating user profile");
    }
  });
}
