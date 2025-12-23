import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Tool } from "../../models/Tools";
import { deleteTool } from "../../services/tools/delete.tool.service";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteToolController = asyncHandler(async (req: Request, res: Response) => {
  const { listing_id } = req.body;

  if (!listing_id) {
    return errorResponse(
      res,
      "Tool ID is required",
      "Provide listing_id of the tool",
      400
    );
  }

  if (!req.user) {
    return errorResponse(
      res,
      "Login is required",
      "Unauthorized access",
      401
    );
  }

  const tool = (await findByDynamicId(
    Tool,
    { listing_id },
    false
  )) as Tool | null;

  if (!tool) {
    return errorResponse(
      res,
      "Tool not found",
      `Tool with ID ${listing_id} does not exist`,
      404
    );
  }

  if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
    return errorResponse(
      res,
      "Forbidden",
      "You are not permitted to delete this tool",
      403
    );
  }

  const deletedCount = await deleteTool(listing_id);

  if (deletedCount === 0) {
    return errorResponse(
      res,
      "Deletion Failed",
      "Tool could not be deleted by service",
      404
    );
  }

  return successResponse(
    res,
    "Tool deleted successfully",
    { data: tool, deletedCount },
    200
  );
}, "Error deleting tool");
