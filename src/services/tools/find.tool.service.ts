import { User } from "../../models/User";
import { findByDynamicId } from "../global/find.service";
import { Tool } from "../../models/Tools";
import { ToolImage } from "../../models/ToolsImages";

import { Op } from "sequelize";

export async function findAllTools(
  order = "createdAt",
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
  if (!user.isAdmin) {
    whereClause = { owner_id: userId };
  }

  if (search) {
    if (searchBy && ["title", "description"].includes(searchBy)) {
      whereClause = {
        ...whereClause,
        [searchBy]: { [Op.iLike]: `%${search}%` },
      };
    } else {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }
  }

  const { count, rows } = await Tool.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["firstname", "lastname", "email", "phoneNumber"],
      },
      {
        model: ToolImage,
        as: "images",
        attributes: { exclude: ["createdAt", "updatedAt", "filepath"] },
      }, // ✅ include images
    ],
    nest: true,
    raw: false,
    distinct: true,
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

export async function findToolsByListingId(listing_id: string) {
  const tool = await Tool.findOne({
    where: { listing_id },
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["firstname", "lastname", "email", "phoneNumber"],
      },
      {
        model: ToolImage,
        as: "images",
        attributes: { exclude: ["createdAt", "updatedAt", "filepath"] },
      },
    ],
  });
  return tool;
}

export async function findToolsByOwnerId(
  owner_id: string,
  search?: string,
  searchBy?: string,
  order = "createdAt",
  asc: "ASC" | "DESC" = "ASC",
  page = 1,
  pageSize = 10,
) {
  let whereClause: any = { owner_id };
  const offset = (page - 1) * pageSize;

  if (search) {
    if (searchBy && ["title", "description"].includes(searchBy)) {
      whereClause = {
        ...whereClause,
        [searchBy]: { [Op.iLike]: `%${search}%` },
      };
    } else {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }
  }

  const { count, rows } = await Tool.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["firstname", "lastname", "email", "phoneNumber"],
      },
      {
        model: ToolImage,
        as: "images",
        attributes: { exclude: ["createdAt", "updatedAt", "filepath"] },
      }, // ✅ include images
    ],
    nest: true,
    raw: false,
    distinct: true,
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
