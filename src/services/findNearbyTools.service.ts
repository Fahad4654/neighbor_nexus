import { Op } from "sequelize";
import { Tool } from "../models/Tools";
import { User } from "../models/User";
import { getDistanceBetweenPoints } from "./googleMapDistance.service";

export async function findNearbyToolsGoogle(
  userId: string,
  maxDistanceKm = 10,
  searchTerm?: string
) {
  const user = await User.findByPk(userId);
  if (!user || !user.geo_location) throw new Error("User location missing");

  const userCoords = {
    lat: user.geo_location.coordinates[1],
    lng: user.geo_location.coordinates[0],
  };

  // Get all tools optionally filtered by search
  const where: any = {};
  if (searchTerm) where.title = { [Op.iLike]: `%${searchTerm}%` };

  const tools = await Tool.findAll({
    where,
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "username", "geo_location"],
      },
    ],
  });

  // Calculate distance via Google API for each tool
  const toolsWithDistance = [];
  for (const tool of tools) {
    if (!tool.owner.geo_location) continue;

    const toolCoords = {
      lat: tool.owner.geo_location.coordinates[1],
      lng: tool.owner.geo_location.coordinates[0],
    };

    const distanceData = await getDistanceBetweenPoints(userCoords, toolCoords);

    if (distanceData.distanceMeters <= maxDistanceKm * 1000) {
      toolsWithDistance.push({
        ...tool.toJSON(),
        distanceMeters: distanceData.distanceMeters,
        distanceText: distanceData.distanceText,
        durationSeconds: distanceData.durationSeconds,
        durationText: distanceData.durationText,
      });
    }
  }

  // Sort by distance ascending
  toolsWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return toolsWithDistance;
}
