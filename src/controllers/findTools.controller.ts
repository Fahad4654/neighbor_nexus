// src/controllers/tool.controller.ts
import { Request, Response } from "express";
import { findNearbyTools } from "../services/findTools.service";
import { findNearbyToolsGoogle } from "../services/findNearbyTools.service";

export const getNearbyTools = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { maxDistance = 10, search, sort } = req.query;

    // Parse sort options from query (expecting JSON string)
    // Example: sort=[{"column":"daily_price","order":"ASC"},{"column":"distance","order":"ASC"}]
    let sortOptions = undefined;
    if (sort) {
      try {
        sortOptions = JSON.parse(String(sort));
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid sort format. Must be JSON array of {column, order}",
        });
      }
    }

    const tools = await findNearbyTools(
      userId,
      Number(maxDistance),
      search ? String(search) : undefined,
      sortOptions
    );

    return res.json({
      success: true,
      distance: Number(maxDistance),
      count: tools.length,
      data: tools,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getNearbyToolsGoogleController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    let { search, maxDistance } = req.query;

    // Convert maxDistance to number safely
    const distanceNumber = maxDistance ? Number(maxDistance) : 10;

    if (isNaN(distanceNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maxDistance value",
      });
    }

    const tools = await findNearbyToolsGoogle(
      userId,
      distanceNumber,
      search ? String(search) : undefined
    );

    return res.json({
      success: true,
      count: tools.length,
      data: tools,
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

