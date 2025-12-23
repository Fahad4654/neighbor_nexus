import { Request, Response } from "express";
import { User } from "../../models/User";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { createUser } from "../../services/user/create.user.service";
import { successResponse, errorResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
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

  const reqBodyValidation = validateRequiredBody(req, res, [
    "username",
    "firstname",
    "lastname",
    "email",
    "password",
    "phoneNumber",
  ]);
  if (!reqBodyValidation) return;

  const newUser = await createUser(req.body);

  const { password, ...userWithoutPassword } = newUser.toJSON();

  return successResponse(
    res,
    "User created successfully",
    { user: userWithoutPassword },
    201
  );
}, "Error creating user");
