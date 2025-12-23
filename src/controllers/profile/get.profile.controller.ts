import { Request, Response } from "express";
import { User } from "../../models/User";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { findAllProfiles } from "../../services/profile/findAll.profile.service";
import {
  errorResponse,
  successResponse,
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPaginationParams, formatPaginationResponse } from "../../utils/pagination";

export const getUsersProfileController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, "Authentication required", "Login is required", 401);
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return errorResponse(res, "User not found", "User ID in token is invalid", 404);
  }

  if (!user.isAdmin) {
    return errorResponse(res, "Admin access required", "Not authorized", 403);
  }

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

  const { order, asc, page, pageSize, search, searchBy } = getPaginationParams(req);

  const profiles = await findAllProfiles(
    order,
    asc,
    page,
    pageSize,
    search,
    searchBy
  );

  const pagination = formatPaginationResponse(profiles.pagination);

  return successResponse(
    res,
    "User Profiles fetched successfully",
    profiles.data,
    200,
    pagination
  );
}, "Error fetching user profiles");
