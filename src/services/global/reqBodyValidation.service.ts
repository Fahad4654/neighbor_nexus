import { Request, Response } from "express";
import { errorResponse } from "../../utils/apiResponse";

export function validateRequiredBody(
  req: Request,
  res: Response,
  fields: string[]
): boolean {
  for (const field of fields) {
    if (!req.body[field]) {
      errorResponse(res, "Missing required field", `Missing ${field}`, 400);
      return false;
    }
  }
  return true;
}
