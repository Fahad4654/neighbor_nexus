import { Op } from "sequelize";
import { Tool } from "../models/Tools";
import { User } from "../models/User";
import { getDistanceBetweenPoints } from "./googleMapDistance.service";

export async function findNearbyToolsGoogle(
  userId: string,
  maxDistanceKm = 10,
  searchTerm?: string
) {
  // Fetch requesting user
  const user = await User.findByPk(userId);
  if (!user || !user.geo_location) {
    throw new Error("User location missing");
  }

  const userCoords = {
    lat: user.geo_location.coordinates[1], // GeoJSON: [lng, lat]
    lng: user.geo_location.coordinates[0],
  };

  // Search filtering
  const where: any = {};
  if (searchTerm) {
    where.title = { [Op.iLike]: `%${searchTerm}%` };
  }

  // Get all tools including owners
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

  const toolsWithDistance: any[] = [];

  for (const tool of tools) {
    // Skip if no owner or missing coordinates
    if (!tool.owner?.geo_location) continue;

    const toolCoords = {
      lat: tool.owner.geo_location.coordinates[1],
      lng: tool.owner.geo_location.coordinates[0],
    };

    // Query Google Distance API
    const distanceData = await getDistanceBetweenPoints(userCoords, toolCoords);

    if (!distanceData) continue;

    // Parse numeric meters safely
    const distanceMeters = Number(distanceData.distanceMeters);

    if (!distanceMeters || isNaN(distanceMeters)) {
      console.warn("Invalid distance returned for tool:", tool.id);
      continue;
    }

    // Apply distance filter
    if (distanceMeters <= maxDistanceKm * 1000) {
      toolsWithDistance.push({
        ...tool.toJSON(),
        distanceMeters,
        distanceText: distanceData.distanceText,
        durationSeconds: Number(distanceData.durationSeconds || 0),
        durationText: distanceData.durationText,
      });
    }
  }

  // Sort by distance ASC
  toolsWithDistance.sort(
    (a, b) => Number(a.distanceMeters) - Number(b.distanceMeters)
  );

  return toolsWithDistance;
}
