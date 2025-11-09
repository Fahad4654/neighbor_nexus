import { Request, Response } from "express";

export function validateRequiredBody(
  req: Request,
  res: Response,
  fields: string[]
): boolean {
  for (const field of fields) {
    if (!req.body[field]) {
      res.status(400).json({ error: `${field} is required` });
      return false;
    }
  }
  return true;
}
