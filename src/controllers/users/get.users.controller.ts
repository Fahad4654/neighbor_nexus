import { Request, Response } from "express";
import { User } from "../../models/User";
import { findByDynamicId } from "../../services/global/find.service";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { Profile } from "../../models/Profile";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { findAllUsers } from "../../services/user/findAll.user.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
import { getPaginationParams, formatPaginationResponse } from "../../utils/pagination";

export async function getUsersController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        return errorResponse(
          res,
          "Request body is required",
          "Missing body for filtering/pagination parameters",
          400
        );
      }

      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
        "page",
        "pageSize",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc, page, pageSize, search, searchBy } = getPaginationParams(req);

      if (!req.user) {
        console.log("login is required");
        return errorResponse(
          res,
          "Login is required",
          "Unauthorized access",
          401
        );
      }

      const usersList = await findAllUsers(
        order,
        asc,
        page,
        pageSize,
        req.user?.id,
        search,
        searchBy
      );

      const pagination = formatPaginationResponse(usersList.pagination);

      console.log("User fetched successfully");

      return successResponse(
        res,
        "User fetched successfully",
        { users: usersList.data },
        200,
        pagination
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      return handleUncaughtError(res, error, "Error fetching users");
    }
  });
}

import { asyncHandler } from "../../utils/asyncHandler";

export const getUsersByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) {
    return errorResponse(
      res,
      "User ID is required",
      "User ID is required as a route parameter (e.g., /users/:id)",
      400
    );
  }

  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User | null;

  if (!user) {
    console.log("User not found");
    return errorResponse(
      res,
      "User not found",
      `User with ID ${userId} does not exist`,
      404
    );
  }

  const typedUserProfile = await findByDynamicId(
    Profile,
    { userId: user.id },
    false
  );
  const userProfile = typedUserProfile as Profile | null;

  if (!userProfile) {
    console.log("User profile not found");
    return errorResponse(
      res,
      "User profile not found",
      `Profile for user ID ${userId} does not exist`,
      404
    );
  }

  if (user.isAdmin && !req.user?.isAdmin) {
    console.log("Access to admin user's details is restricted");
    return errorResponse(
      res,
      "Forbidden",
      "Access to admin user's details is restricted",
      403
    );
  }

  const noPasswordUser = { ...user.get() };
  delete noPasswordUser.password;

  return successResponse(
    res,
    "User details fetched successfully",
    { user: noPasswordUser, profile: userProfile },
    200
  );
}, "Error fetching user details");
