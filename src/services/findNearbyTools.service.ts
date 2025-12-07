// src/services/findNearbyTools.service.ts

import { Op } from "sequelize";
// Assuming Tool, User models and getDistanceBetweenPoints service exist
import { Tool } from "../models/Tools";
import { User } from "../models/User";
import { getDistanceBetweenPoints } from "./googleMapDistance.service";

// Interfaces for better type safety
interface Coordinates {
  lat: number;
  lng: number;
}

interface SortOption {
  column: string; // e.g., 'listing_type', 'hourly_price', 'distanceMeters'
  order: "ASC" | "DESC";
}

// Extended interface for the result set (Tool data + distance info)
interface ToolWithDistance extends Tool {
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationText: string;
}

// Helper function for dynamic, multi-column sorting in JavaScript
function dynamicSort(
  a: ToolWithDistance,
  b: ToolWithDistance,
  options: SortOption[]
): number {
  const COMPLEX_PROPS = ['geo_location', 'owner', 'images']; // Explicitly list complex properties to ignore

  for (const option of options) {
    // Cast column to string to satisfy array access typing
    const column = option.column as string; 
    const order = option.order === "ASC" ? 1 : -1;

    // Check if the property should be ignored for simple sorting
    if (COMPLEX_PROPS.includes(column)) continue;

    // Use bracket notation to safely access the property
    // We must use 'any' or check existence here because TypeScript can't guarantee 
    // the dynamic string key exists on the interface if we don't use 'keyof'.
    const aValue = (a as any)[column];
    const bValue = (b as any)[column];

    // Handle nulls/undefined: push nulls/undefined values to the end
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    // Numeric comparison (most reliable, for prices, distance, timestamps)
    if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
    } 
    // String/Date comparison (for title, listing_type)
    else {
        const comparison = String(aValue).localeCompare(String(bValue));
        if (comparison !== 0) {
            return comparison * order;
        }
    }
    // If values are equal, proceed to the next sort option
  }
  return 0;
}

export async function findNearbyToolsGoogle(
  userId: string,
  maxDistanceKm = 10,
  searchTerm?: string,
  sortOptions: SortOption[] = [] // New parameter for dynamic sorting
) {
  // 1. Fetch requesting user's location
  const user = await User.findByPk(userId, {
    attributes: ["id", "geo_location"],
  });

  if (!user || !user.geo_location) {
    throw new Error("User location missing or User not found.");
  }

  const userCoords: Coordinates = {
    // GeoJSON coordinates are [longitude, latitude]
    lat: user.geo_location.coordinates[1],
    lng: user.geo_location.coordinates[0],
  };

  // 2. Build Search Filtering
  const where: any = {};
  if (searchTerm) {
    // Search by title (or description if desired)
    where.title = { [Op.iLike]: `%${searchTerm}%` };
  }

  // 3. Get all potentially matching tools
  const tools = await Tool.findAll({
    where,
    // Add owner details
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "username", "firstname", "lastname"],
      },
    ],
  });

  const toolsWithDistance: ToolWithDistance[] = [];
  const maxDistanceMeters = maxDistanceKm * 1000;

  // 4. Calculate Distance and Filter using Google API
  for (const tool of tools) {
    // ✅ FIX: Use the tool's own location for the coordinates
    if (!tool.geo_location) continue;

    const toolCoords: Coordinates = {
      // GeoJSON coordinates are [longitude, latitude]
      lat: tool.geo_location.coordinates[1],
      lng: tool.geo_location.coordinates[0],
    };

    // Query Google Distance API
    const distanceData = await getDistanceBetweenPoints(userCoords, toolCoords);

    if (!distanceData) continue;

    const distanceMeters = Number(distanceData.distanceMeters);

    if (!distanceMeters || isNaN(distanceMeters)) continue;

    // Apply distance filter
    if (distanceMeters <= maxDistanceMeters) {
      toolsWithDistance.push({
        ...tool.toJSON(),
        distanceMeters,
        distanceText: distanceData.distanceText,
        durationSeconds: Number(distanceData.durationSeconds || 0),
        durationText: distanceData.durationText,
      } as ToolWithDistance);
    }
  }

  // 5. Apply Dynamic Sorting
  if (sortOptions.length > 0) {
    // Use custom sort options if provided
    toolsWithDistance.sort((a, b) => dynamicSort(a, b, sortOptions));
  } else {
    // Default: Sort by distance ASC if no custom sort is provided
    toolsWithDistance.sort(
      (a, b) => Number(a.distanceMeters) - Number(b.distanceMeters)
    );
  }

  return toolsWithDistance;
}