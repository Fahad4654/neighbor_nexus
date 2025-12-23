// create.tools.controller.ts
import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { createTool } from "../../services/tools/create.tool.service";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createToolController = asyncHandler(async (req: Request, res: Response) => {
  const requiredFields = [
    "owner_id",
    "listing_type",
    "title",
    "hourly_price",
    "daily_price",
    "security_deposit",
    "is_available",
  ];

  const reqBodyValidation = validateRequiredBody(req, res, requiredFields);
  if (!reqBodyValidation) return;

  // FIX 1: Safely retrieve uploaded files from req.files
  const files = (req.files as Express.Multer.File[]) || [];

  // FIX 2: Pass req.body AND the uploaded files to the service
  const newTool = await createTool(req.body, files);

  if (!newTool) {
    return errorResponse(
      res,
      "Failed to create tool",
      "Tool creation service returned null",
      500
    );
  }

  // REMOVED: Manual creation of 'default.png' is removed.

  return successResponse(
    res,
    "Tool created successfully",
    { data: newTool },
    201
  );
}, "Error creating tool");
