import { Request, Response } from "express";
import path from "path";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { ToolImage } from "../../models/ToolsImages";
import { createTool } from "../../services/tools/create.tool.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

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

    const newTool = await createTool(req.body);

    if (!newTool) {
      return errorResponse(
        res,
        "Failed to create tool",
        "Tool creation service returned null",
        500
      );
    }

    await ToolImage.create({
      tool_id: newTool.listing_id,
      image_url: "/media/tools/default.png",
      filepath: path.join(process.cwd(), "media/tools/default.png"),
      is_primary: true,
    });

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
