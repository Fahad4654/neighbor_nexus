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
  handleUncaughtError,
} from "../../utils/apiResponse";

// ✅ Get all tools with pagination
export async function getToolsController(req: Request, res: Response) {
  try {
    const reqBodyValidation = validateRequiredBody(req, res, ["order", "asc"]);
    if (!reqBodyValidation) return;

    if (!req.user) {
      return errorResponse(res, "User is required", "Login is required", 401);
    }

    const { order, asc, page = 1, pageSize = 10 } = req.body;

    const toolsList = await findAllTools(
      order,
      asc,
      Number(page),
      Number(pageSize),
      req.user.id
    );

    const { total, ...restOfPagination } = toolsList.pagination;
    const pagination = { totalCount: total, ...restOfPagination };

    return successResponse(
      res,
      "Tools fetched successfully",
      toolsList.data.map((t) => t.get({ plain: true })),
      200,
      pagination
    );
  } catch (error) {
    console.error("Error fetching tools:", error);
    return handleUncaughtError(res, error, "Error fetching tools");
  }
}

// ✅ Get single tool by listing_id
export async function getToolByListingIdController(
  req: Request,
  res: Response
) {
  try {
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
  } catch (error) {
    console.error("Error fetching tool by listing_id:", error);
    return handleUncaughtError(res, error, "Error fetching tool");
  }
}

// Get tools by owner_id
export async function getToolsByOwnerIdController(req: Request, res: Response) {
  try {
    const { owner_id } = req.params;

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

    const tools = await findToolsByOwnerId(owner.id);

    return successResponse(
      res,
      "Tools fetched successfully",
      tools.map((t) => t.get({ plain: true })),
      200
    );
  } catch (error) {
    console.error("Error fetching tools by owner_id:", error);
    return handleUncaughtError(res, error, "Error fetching tools");
  }
}
