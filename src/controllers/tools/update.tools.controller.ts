import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Tool } from "../../models/Tools";
import { updateTool } from "../../services/tools/update.tool.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function updateToolInfoController(req: Request, res: Response) {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return errorResponse(
        res,
        "Tool ID is required",
        "Missing listing_id in request body",
        400
      );
    }

    const tool = (await findByDynamicId(
      Tool,
      { listing_id },
      false
    )) as Tool | null;

    if (!tool)
      return errorResponse(
        res,
        "Tool not found",
        `Tool with ID ${listing_id} does not exist`,
        404
      );

    if (!req.user)
      return errorResponse(res, "Login required", "Unauthorized access", 401); // Changed from 400 to 401

    if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
      return errorResponse(
        res,
        "Forbidden",
        "Only owner or admin can update this tool",
        403
      );
    }

    const updatedTool = await updateTool(req.body);

    if (!updatedTool) {
      return errorResponse(
        res,
        "Update Failed",
        "No valid fields provided or service failed to update tool",
        400
      );
    }

    return successResponse(
      res,
      "Tool updated successfully",
      { data: updatedTool },
      200
    );
  } catch (error) {
    console.error("Error updating tool info:", error);
    return handleUncaughtError(res, error, "Error updating tool info");
  }
}
