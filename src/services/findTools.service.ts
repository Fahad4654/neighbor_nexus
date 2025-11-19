import { sequelize } from "../config/database";
import { Tool } from "../models/Tools";
import { User } from "../models/User";

interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export async function findNearbyTools(userId: string, maxDistanceKm = 10) {
  const user = await User.findByPk(userId);

  if (!user || !user.geo_location) throw new Error("User location missing");

  const [lng, lat] = user.geo_location.coordinates;

  const maxDistanceMeters = maxDistanceKm * 1000;

  const tools = await Tool.findAll({
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "username", "geo_location"],
      },
    ],
    attributes: {
      include: [
        [
          sequelize.literal(`
            ST_Distance(
              owner.geo_location,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
            )
          `),
          "distance_meters",
        ],
      ],
    },

    // ✅ filter based on maxDistance using ST_DWithin
    where: sequelize.where(
      sequelize.literal(`
        ST_DWithin(
          owner.geo_location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${maxDistanceMeters}
        )
      `),
      true
    ),

    order: sequelize.literal("distance_meters ASC"),
  });

  return tools;
}
