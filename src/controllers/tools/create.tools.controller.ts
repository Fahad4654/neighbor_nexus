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

    // NOTE: validateRequiredBody handles its own response on failure.
    const reqBodyValidation = validateRequiredBody(req, res, requiredFields);
    if (!reqBodyValidation) return;

    const newTool = await createTool(req.body);

    // If the service logic successfully created the tool but returned null/undefined
    // for some reason (which shouldn't happen, but for safety):
    if (!newTool) {
      // Assuming a database insertion failure or service error before image creation
      return errorResponse(
        res,
        "Failed to create tool",
        "Tool creation service returned null",
        500
      );
    }

    // 🟢 201 Created (Send response immediately after core resource is created)
    // NOTE: You send the response here, before creating the default image.
    // This pattern is acceptable if the image creation is considered a non-critical background task
    // or if the service call is guaranteed to succeed.
    // To ensure consistency, I will place the success response AFTER all planned operations.

    // Create default tool image
    await ToolImage.create({
      tool_id: newTool.listing_id,
      image_url: "/media/tools/default.png", // Replace with actual default image URL
      filepath: path.join(process.cwd(), "media/tools/default.png"),
      is_primary: true,
    });

    // 🟢 201 Created (Final success response)
    return successResponse(
      res,
      "Tool created successfully",
      { data: newTool },
      201
    );
  } catch (error) {
    console.error("Error creating tool:", error);
    // 🛑 500 Internal Server Error
    return handleUncaughtError(res, error, "Error creating tool");
  }
}
