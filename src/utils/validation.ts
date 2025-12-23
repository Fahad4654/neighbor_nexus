import { Response } from "express";
import { errorResponse } from "./apiResponse";

/**
 * Validates that the request has a user attached (authentication check).
 * @param reqUser - The user object from the request (req.user).
 * @param res - Express response object.
 * @returns boolean - True if valid, False if response sent.
 */
export const validateAuth = (reqUser: any, res: Response): boolean => {
  if (!reqUser) {
    errorResponse(res, "Login is required", "Unauthorized access", 401);
    return false;
  }
  return true;
};

/**
 * Validates that a specific ID exists in the request body/params.
 * @param id - The ID value to check.
 * @param fieldName - The name of the field (e.g., 'borrower_id') used in error message.
 * @param res - Express response object.
 * @param location - Where the ID was expected ('request body' or 'route parameter').
 * @returns boolean - True if valid, False if response sent.
 */
export const validateId = (
  id: string | undefined,
  fieldName: string,
  res: Response,
  location: string = "request body"
): boolean => {
  if (!id) {
    errorResponse(
      res,
      `${fieldName} is required`,
      `Missing ${fieldName} in ${location}`,
      400
    );
    return false;
  }
  return true;
};

/**
 * Validates authorization: checks if the authenticated user matches the target user or is an admin.
 * @param reqUser - The authenticated user.
 * @param targetUserId - The ID of the user resource being accessed.
 * @param res - Express response object.
 * @param message - Optional custom error message.
 * @returns boolean - True if authorized, False if response sent.
 */
export const validateAuthorization = (
  reqUser: any,
  targetUserId: string,
  res: Response,
  message: string = "Forbidden"
): boolean => {
  if (reqUser.id !== targetUserId && !reqUser.isAdmin) {
    errorResponse(res, "Forbidden", message, 403);
    return false;
  }
  return true;
};
