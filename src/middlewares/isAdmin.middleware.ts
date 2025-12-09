import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { errorResponse, handleUncaughtError } from "../utils/apiResponse";

export const isAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return errorResponse(
          res,
          "Authentication required",
          "Login is required to access this resource",
          401
        );
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return errorResponse(
          res,
          "User not found",
          "User ID in token is invalid or deleted",
          404
        );
      }

      if (!req.user.isAdmin) {
        return errorResponse(
          res,
          "Admin access required",
          "User is not authorized as an administrator",
          403
        );
      }
      next();
    } catch (error) {
      console.error("Admin check error:", error);
      return handleUncaughtError(
        res,
        error,
        "Internal server error during admin check"
      );
    }
  };
};
