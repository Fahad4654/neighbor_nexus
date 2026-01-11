import { Profile } from "../../models/Profile";
import { User } from "../../models/User";
import { getSearchWhereClause as getSearchWhereClauseV2 } from "../../utils/search.v2";

export async function findAllProfiles(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Profile, searchBy);

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
