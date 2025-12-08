import { Request, Response } from "express";
import path from "path";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { ToolImage } from "../../models/ToolsImages";
import { createTool } from "../../services/tools/create.tool.service";

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

    res.status(201).json({
      message: "Tool created successfully",
      data: newTool,
      status: "success",
    });
    if (!newTool) return;

    // Create default tool image
    await ToolImage.create({
      tool_id: newTool.listing_id,
      image_url: "/media/tools/default.png", // Replace with actual default image URL
      filepath: path.join(process.cwd(), "media/tools/default.png"),
      is_primary: true,
    });
  } catch (error) {
    console.error("Error creating tool:", error);
    res.status(500).json({ message: "Error creating tool", error });
  }
}
