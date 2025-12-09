import { Request, Response } from "express";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { findAllProfiles } from "../../services/profile/findAll.profile.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function getUsersProfileController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required for filtering/pagination");
        return errorResponse(
          res,
          "Request body is required",
          "Empty request body for required parameters",
          400
        );
      }

      // NOTE: validateRequiredBody handles its own response on failure.
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc, page = 1, pageSize = 10 } = req.body;

      const profiles = await findAllProfiles(
        order,
        asc,
        Number(page),
        Number(pageSize)
      );

      return successResponse(
        res,
        "User Profiles fetched successfully",
        { profilelist: profiles }, // Note: You might want to restructure this if 'profiles' includes pagination meta data
        200
      );
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      return handleUncaughtError(res, error, "Error fetching user profiles");
    }
  });
}
