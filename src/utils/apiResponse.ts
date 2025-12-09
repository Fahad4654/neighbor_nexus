// apiResponse.ts

import { Response } from "express";

/**
 * 🛠️ Interface for a Standard API Response
 * Use this interface to ensure all your controller responses follow a consistent structure.
 */
interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T; // Data payload (for success)
  error?: any; // Error payload (for specific or general errors)
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }; // Optional for list endpoints
}

/**
 * 🟢 Sends a standardized success response.
 * @param res The Express response object.
 * @param message A human-readable success message.
 * @param data The main payload (user, tool, list, etc.).
 * @param statusCode The HTTP status code (default: 200).
 * @returns The Express response object.
 */
export function successResponse<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  pagination?: ApiResponse<T>['pagination']
): Response {
  const response: ApiResponse<T> = {
    status: "success",
    message,
  };
  if (data !== undefined) {
    response.data = data;
  }
  if (pagination) {
    response.pagination = pagination;
  }
  return res.status(statusCode).json(response);
}

/**
 * 🔴 Sends a standardized error response.
 * @param res The Express response object.
 * @param message A human-readable error message.
 * @param error The detailed error object or string (optional).
 * @param statusCode The HTTP status code (default: 500 for uncaught errors, 400 for known client errors).
 * @returns The Express response object.
 */
export function errorResponse(
  res: Response,
  message: string,
  error?: any,
  statusCode: number = 500
): Response {
  // Always log 500 errors for internal debugging
  if (statusCode >= 500) {
    console.error(`API Error (${statusCode}): ${message}`, error);
  }

  const response: ApiResponse<never> = {
    status: "error",
    message,
    error: error instanceof Error ? error.message : error, // Extract message or use full error
  };
  
  return res.status(statusCode).json(response);
}

// --- Example Catch Block Helper ---
// You can use this function for the final catch block in all controllers.
export function handleUncaughtError(res: Response, error: unknown, specificMessage?: string): Response {
    return errorResponse(
        res,
        specificMessage || "Internal Server Error",
        error,
        500
    );
}

// --- Usage Note: ---
// For a 404 (Not Found) error: 
// return errorResponse(res, "Resource not found", "Tool not found", 404);

// For a 400 (Bad Request) validation error:
// return errorResponse(res, "Missing required field", "listing_id is required", 400);