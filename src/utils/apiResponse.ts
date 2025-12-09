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
  if (data !== undefined) {
    response.data = data;
  }
  if (pagination) {
    response.pagination = pagination;
  }
  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  error?: any,
  statusCode: number = 500
): Response {
  if (statusCode >= 500) {
    console.error(`API Error (${statusCode}): ${message}`, error);
  }

  const response: ApiResponse<never> = {
    status: "error",
    message,
    error: error instanceof Error ? error.message : error,
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
