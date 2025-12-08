import { Profile } from "../../models/Profile";
import { User } from "../../models/User";

export async function findAllProfiles(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Profile.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "username","firstname", "lastname", "email", "phoneNumber"],
      },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
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