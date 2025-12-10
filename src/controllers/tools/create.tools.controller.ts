// create.tools.controller.ts

import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
// Removed unused import: import { ToolImage } from "../../models/ToolsImages";
// Removed unused import: import path from "path"; 
import { createTool } from "../../services/tools/create.tool.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";
// Added Express import for file typing
import { Express } from "express";


export async function createToolController(req: Request, res: Response) {
  try {
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

    // 💡 FIX: Safely retrieve uploaded files from req.files
    const files = (req.files as Express.Multer.File[]) || [];
    
    console.log("req.body:", req.body);
    // 💡 FIX: Pass req.body AND the uploaded files to the service
    const newTool = await createTool(req.body, files);

    if (!newTool) {
      return errorResponse(
        res,
        "Failed to create tool",
        "Tool creation service returned null",
        500
      );
    }

    // ❌ REMOVED: Manual creation of 'default.png' is no longer needed
    // The service handles image creation if files are present.

    return successResponse(
      res,
      "Tool created successfully",
      { data: newTool },
      201
    );
  } catch (error) {
    console.error("Error creating tool:", error);
    return handleUncaughtError(res, error, "Error creating tool");
  }
}