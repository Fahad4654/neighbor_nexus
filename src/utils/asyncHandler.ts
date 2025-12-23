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
      console.error(`Error in ${fn.name}:`, error);
      
      // If error has a status code, use it
      const statusCode = error.statusCode || error.status;
      if (statusCode && typeof statusCode === "number") {
          return errorResponse(res, error.message || errorMessage, error, statusCode);
      }

      handleUncaughtError(res, error, errorMessage);
    });
  };
};
