import { Request, Response } from "express";
import { findNearbyToolsGoogle } from "../../services/findTools/findNearbyToolsByGoogle.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

// Define the expected structure for sort options
interface SortOption {
  column: string; // e.g., 'listing_type', 'hourly_price', 'distanceMeters'
  order: "ASC" | "DESC";
}

export const getNearbyToolsGoogleController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    let { search, maxDistance, sort } = req.query;

    // 1. Convert maxDistance to number safely
    const distanceNumber = maxDistance ? Number(maxDistance) : 10;
    if (isNaN(distanceNumber)) {
      return errorResponse(
        res,
        "Invalid maxDistance value",
        "maxDistance must be a numerical value",
        400
      );
    }

    // 2. Parse dynamic sort options
    let sortOptions: SortOption[] = [];
    if (sort) {
      try {
        // Expected format: sort=[{"column":"daily_price","order":"ASC"}, ...]
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

    // 3. Call the updated service function
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
    // If the error is 'User location missing' (from service), return 400
    if (error.message && error.message.includes("User location missing")) {
      return errorResponse(
        res,
        "Cannot find tools",
        "User location missing in profile data or not accessible",
        400
      );
    }
    return handleUncaughtError(res, error, "Failed to fetch nearby tools");
  }
};
