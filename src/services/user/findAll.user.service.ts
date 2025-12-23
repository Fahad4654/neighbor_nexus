import { User } from "../../models/User";
import { Profile } from "../../models/Profile";
import { findByDynamicId } from "../global/find.service";

import { Op } from "sequelize";

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

  let whereClause: any = {};

  if (search) {
    if (searchBy && ["firstname", "lastname", "email"].includes(searchBy)) {
      whereClause = {
        [searchBy]: { [Op.iLike]: `%${search}%` },
      };
    } else {
      whereClause = {
        [Op.or]: [
          { firstname: { [Op.iLike]: `%${search}%` } },
          { lastname: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }
  }

  const { count, rows } = await User.findAndCountAll({
    where: whereClause, // ✅ Apply condition
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
    raw: false, // remove raw so nested JSON works correctly
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
