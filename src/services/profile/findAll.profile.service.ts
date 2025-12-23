import { Op } from "sequelize";
import { Profile } from "../../models/Profile";
import { User } from "../../models/User";

export async function findAllProfiles(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  let whereClause: any = {};
  if (search) {
    if (searchBy) {
      if (["bio", "address"].includes(searchBy)) {
        whereClause = {
          ...whereClause,
          [searchBy]: { [Op.iLike]: `%${search}%` },
        };
      } else if (["firstname", "lastname", "email"].includes(searchBy)) {
        whereClause = {
          ...whereClause,
          [`$user.${searchBy}$`]: { [Op.iLike]: `%${search}%` },
        };
      }
    } else {
      whereClause = {
        [Op.or]: [
          { bio: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
          { "$user.firstname$": { [Op.iLike]: `%${search}%` } },
          { "$user.lastname$": { [Op.iLike]: `%${search}%` } },
          { "$user.email$": { [Op.iLike]: `%${search}%` } },
        ],
      };
    }
  }

  const { count, rows } = await Profile.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "user",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
    subQuery: false, // Required for querying on included model in top-level where
  });
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}
