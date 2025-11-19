import { Request, Response } from "express";
import { findNearbyTools } from "../services/findTools.service";

export async function getNearbyTools(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const maxDistanceKm = req.query.distance ? Number(req.query.distance) : 10; // default 10km

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    if (isNaN(maxDistanceKm)) {
      return res.status(400).json({ error: "Distance must be a number." });
    }

    const tools = await findNearbyTools(userId, maxDistanceKm);

    return res.status(200).json({
      success: true,
      distanceKm: maxDistanceKm,
      count: tools.length,
      tools,
    });
  } catch (err: any) {
    console.error("Error finding nearby tools:", err);
    return res.status(500).json({
      error: err.message || "Something went wrong.",
    });
  }
}
