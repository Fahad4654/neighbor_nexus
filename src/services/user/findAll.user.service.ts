import { User } from "../../models/User";
import { Profile } from "../../models/Profile";
import { findByDynamicId } from "../global/find.service";
import { getSearchWhereClause as getSearchWhereClauseV2 } from "../../utils/search.v2";

export async function findAllUsers(
  order = "id",
  asc: "ASC" | "DESC" = "ASC",
  page = 1,
  pageSize = 10,
  userId: string,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User | null;
  if (!user) throw new Error("User not found");

  const whereClause = getSearchWhereClauseV2(search, User, searchBy);

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Profile,
        attributes: {
          exclude: [
            "userId",
            "createdBy",
            "updatedBy",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    ],
    nest: true,
    raw: false,
    limit: pageSize,
    distinct: true,
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
