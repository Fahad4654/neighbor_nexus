import { Response } from "express";

interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export function successResponse<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  pagination?: ApiResponse<T>["pagination"]
): Response {
  const response: ApiResponse<T> = {
    status: "success",
    message,
  };
  if (data !== undefined) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  error?: any,
  statusCode: number = 500
): Response {
  // Log critical server errors
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]: ${message}`, error);
  }

  // Smart Error Parsing
  let parsedError = error;

  // If it's a Sequelize Validation/Unique error, it has an 'errors' array
  if (error?.errors && Array.isArray(error.errors)) {
    parsedError = error.errors.map((e: any) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  }
  // If it's a standard Error object but not a Sequelize list
  else if (error instanceof Error) {
    parsedError = error.message;
  }

  const response: ApiResponse<never> = {
    status: "error",
    message,
    error: parsedError,
  };

  return res.status(statusCode).json(response);
}

export function handleUncaughtError(
  res: Response,
  error: unknown,
  specificMessage?: string
): Response {
  return errorResponse(
    res,
    specificMessage || "Internal Server Error",
    error,
    500
  );
}
