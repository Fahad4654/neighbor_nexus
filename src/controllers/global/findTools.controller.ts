import { Request, Response } from "express";
import { findNearbyToolsGoogle } from "../../services/findTools/findNearbyToolsByGoogle.service";
import {
  errorResponse,
  successResponse,
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

// Define the expected structure for sort options
interface SortOption {
  column: string;
  order: "ASC" | "DESC";
}

export const getNearbyToolsGoogleController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  let { search, maxDistance, sort } = req.query;

  const distanceNumber = maxDistance ? Number(maxDistance) : 10;
  if (isNaN(distanceNumber)) {
    return errorResponse(
      res,
      "Invalid maxDistance value",
      "maxDistance must be a numerical value",
      400
    );
  }

  let sortOptions: SortOption[] = [];
  if (sort) {
    try {
      sortOptions = JSON.parse(String(sort));
      if (!Array.isArray(sortOptions)) {
        throw new Error("Sort must be an array.");
      }
    } catch (err) {
      return errorResponse(
        res,
        "Invalid sort format",
        "Sort must be a JSON array of {column: string, order: 'ASC'|'DESC'}",
        400
      );
    }
  }

  try {
    const tools = await findNearbyToolsGoogle(
      userId,
      distanceNumber,
      search ? String(search) : undefined,
      sortOptions
    );

    return successResponse(
      res,
      "Nearby tools fetched successfully",
      {
        count: tools.length,
        tools: tools,
      },
      200
    );
  } catch (error: any) {
    if (error.message && error.message.includes("User location missing")) {
       return errorResponse(
        res,
        "Cannot find tools",
        "User location missing in profile data or not accessible",
        400
      );
    }
    throw error;
  }
}, "Failed to fetch nearby tools");
