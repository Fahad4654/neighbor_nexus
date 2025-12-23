import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { User } from "../../models/User";
import {
  findAllTools,
  findToolsByListingId,
  findToolsByOwnerId,
} from "../../services/tools/find.tool.service";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPaginationParams, formatPaginationResponse } from "../../utils/pagination";

// ✅ Get all tools with pagination
export const getToolsController = asyncHandler(async (req: Request, res: Response) => {
  const reqBodyValidation = validateRequiredBody(req, res, ["order", "asc"]);
  if (!reqBodyValidation) return;

  if (!req.user) {
    return errorResponse(res, "User is required", "Login is required", 401);
  }

  const { order, asc, page, pageSize, search, searchBy } = getPaginationParams(req);

  const toolsList = await findAllTools(
    order,
    asc,
    page,
    pageSize,
    req.user.id,
    search,
    searchBy
  );

  const pagination = formatPaginationResponse(toolsList.pagination);

  return successResponse(
    res,
    "Tools fetched successfully",
    { toolsList: toolsList.data },
    200,
    pagination
  );
}, "Error fetching tools");

// ✅ Get single tool by listing_id
export const getToolByListingIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { listing_id } = req.params;

  const tool = await findToolsByListingId(listing_id);

  if (!tool) {
    return errorResponse(
      res,
      "Tool not found",
      `Tool with ID ${listing_id} does not exist`,
      404
    );
  }

  return successResponse(
    res,
    "Tool fetched successfully",
    tool.get({ plain: true }),
    200
  );
}, "Error fetching tool");

// Get tools by owner_id
export const getToolsByOwnerIdController = asyncHandler(async (req: Request, res: Response) => {
  const { owner_id } = req.params;
  const { search, searchBy } = getPaginationParams(req);

  if (!owner_id) {
    return errorResponse(
      res,
      "Owner ID is required",
      "Missing owner_id in route parameter",
      400
    );
  }

  const ownerExists = await findByDynamicId(User, { id: owner_id }, false);
  const owner = ownerExists as User | null;

  if (!owner) {
    return errorResponse(
      res,
      "Owner not found",
      `User with ID ${owner_id} does not exist`,
      404
    );
  }

  const tools = await findToolsByOwnerId(owner.id, search, searchBy);

  return successResponse(
    res,
    "Tools fetched successfully",
    tools.map((t) => t.get({ plain: true })),
    200
  );
}, "Error fetching tools");
