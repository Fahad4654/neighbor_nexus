// src/controllers/tool.controller.ts

import { Request, Response } from "express";
import { findNearbyToolsGoogle } from "../../services/findTools/findNearbyTools.service";


// Define the expected structure for sort options
interface SortOption {
  // ✅ FIX: Changed 'sort' to 'column' to match the JSON expectation and service logic
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
      return res.status(400).json({
        success: false,
        message: "Invalid maxDistance value",
      });
    }

    // 2. Parse dynamic sort options
    let sortOptions: SortOption[] = [];
    if (sort) {
      try {
        // Expected format: sort=[{"column":"daily_price","order":"ASC"}, {"column":"distanceMeters","order":"DESC"}]
        sortOptions = JSON.parse(String(sort));
        if (!Array.isArray(sortOptions)) {
            throw new Error('Sort must be an array.');
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid sort format. Must be a JSON array of {column: string, order: 'ASC'|'DESC'}",
        });
      }
    }

    // 3. Call the updated service function
    const tools = await findNearbyToolsGoogle(
      userId,
      distanceNumber,
      search ? String(search) : undefined,
      sortOptions
    );

    return res.json({
      success: true,
      count: tools.length,
      data: tools,
    });
  } catch (error: any) {
    // If the error is 'User location missing' (from service), return 400
    const statusCode = error.message.includes("User location missing") ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};