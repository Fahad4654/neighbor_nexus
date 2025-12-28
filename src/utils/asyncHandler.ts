import { Request, Response, NextFunction } from "express";
import { handleUncaughtError, errorResponse } from "./apiResponse";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (
  fn: AsyncController,
  errorMessage: string = "Internal Server Error"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // 1. Log the full error to the terminal for development
      console.error(`Error caught in handler (${fn.name || 'Anonymous'}):`, error);

      // 2. Catch Sequelize Validation & Unique Constraint Errors
      if (error.name === "SequelizeUniqueConstraintError" || error.name === "SequelizeValidationError") {
        // Use the first validation message as the main response message
        const displayMessage = error.errors && error.errors.length > 0
          ? error.errors[0].message
          : "Validation error";

        return errorResponse(res, displayMessage, error, 400);
      }

      // 3. Catch Raw Postgres Errors (e.g., Foreign Key violations)
      if (error.parent && error.parent.code === "23505") {
        const detail = error.parent.detail || "This record already exists.";
        return errorResponse(res, detail, error.parent, 400);
      }

      // 4. Handle custom errors that already have a status code
      const statusCode = error.statusCode || error.status;
      if (statusCode && typeof statusCode === "number") {
        return errorResponse(res, error.message || errorMessage, error, statusCode);
      }

      // 5. Default Fallback
      handleUncaughtError(res, error, errorMessage);
    });
  };
};