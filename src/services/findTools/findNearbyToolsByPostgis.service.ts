import { Op, Order, literal } from "sequelize";
import { sequelize } from "../../config/database";
import { Tool } from "../../models/Tools";
import { User } from "../../models/User";

type ToolSortableFields =
  | "listing_type"
  | "title"
  | "description"
  | "hourly_price"
  | "daily_price"
  | "security_deposit"
  | "is_available"
  | "distance";

interface SortOption {
  column: ToolSortableFields;
  order: "ASC" | "DESC";
}

export async function findNearbyTools(
  userId: string,
  maxDistanceKm = 10,
  searchTerm?: string,
  sortOptions: SortOption[] = [{ column: "distance", order: "ASC" }]
) {
  const user = await User.findByPk(userId);

  if (!user || !user.geo_location) throw new Error("User location missing");

  const [lng, lat] = (user.geo_location as any).coordinates;
  const maxDistanceMeters = maxDistanceKm * 1000;

  // Search filter
  const searchFilter: any = {};
  if (searchTerm) {
    searchFilter[Op.or] = [
      { title: { [Op.iLike]: `%${searchTerm}%` } },
      { description: { [Op.iLike]: `%${searchTerm}%` } },
      sequelize.where(sequelize.cast(sequelize.col("listing_type"), "TEXT"), {
        [Op.iLike]: `%${searchTerm}%`,
      }),
    ];
  }

  // Build order clause
  const orderClause: Order = sortOptions.map((opt) => {
    if (opt.column === "distance") {
      return literal(`distance_meters ${opt.order}`);
    }
    // Type assertion for Sequelize order tuple
    return [opt.column, opt.order] as [string, "ASC" | "DESC"];
  });

  const tools = await Tool.findAll({
    where: {
      ...searchFilter,
      [Op.and]: sequelize.where(
        literal(`
          ST_DWithin(
            owner.geo_location,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${maxDistanceMeters}
          )
        `),
        true
      ),
    },
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
          literal(`
            ST_Distance(
              owner.geo_location,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
            )
          `),
          "distance_meters",
        ],
      ],
    },
    order: orderClause,
  });

  return tools;
}
