import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Profile } from "../models/Profile";
import { createProfile } from "./profile.service";
import { Op } from "sequelize";
import {
  ADMIN_MAIL,
  ADMIN_USERNAME,
  CLIENT_URL,
  COMPANY_NAME,
} from "../config";
import { MailService } from "./mail/mail.service";
import { findByDynamicId } from "./find.service";
import { Tool } from "../models/Tools";

const mailService = new MailService();

export const generateToken = (id: string): string => {
  return id.slice(-9).toUpperCase(); // Take last 9 chars and uppercase
};

export async function findAllTools(
  order = "id",
  asc: "ASC" | "DESC" = "ASC",
  page = 1,
  pageSize = 10,
  userId: string
) {
  const offset = (page - 1) * pageSize;
  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User | null;
  if (!user) throw new Error("User not found");
  let whereClause: any = {};
  if (!user.isAdmin) {
    whereClause = { owner_id: userId };
  }
  const { count, rows } = await Tool.findAndCountAll({
    where: whereClause, // ✅ Apply condition
    include: [
      {
        model: User,
        as: "owner",
      },
    ],
    nest: true,
    raw: false, // remove raw so nested JSON works correctly
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

export async function createTool(data: {
  owner_id: string;
  listing_type: string;
  title: string;
  description?: string;
  hourly_price?: number;
  daily_price?: number;
  security_deposit?: number;
  is_available?: boolean;
}) {
  const newTool = await Tool.create({
    owner_id: data.owner_id,
    listing_type: data.listing_type as "Tool" | "Skill",
    title: data.title,
    description: data.description,
    hourly_price: data.hourly_price,
    daily_price: data.daily_price,
    security_deposit: data.security_deposit,
    is_available: data.is_available !== undefined ? data.is_available : true,
  });
  return newTool;
}

export async function updateTool(data: Partial<Tool> & { listing_id: string }) {
  const UpdateTool = await Tool.findOne({
    where: { listing_id: data.listing_id },
  });
  if (!UpdateTool) {
    console.log("Tool not found for update");
    throw new Error("Tool not found");
  }

  const allowedFields: Array<keyof Tool> = [
    "listing_type",
    "title",
    "description",
    "hourly_price",
    "daily_price",
    "security_deposit",
    "is_available",
  ];
  const updates: Partial<Tool> = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (Object.keys(updates).length === 0) return null;

  await UpdateTool.update(updates);
  return Tool.findByPk(UpdateTool.listing_id, {
    include: [{ model: User, as: "owner" }],
  });
}

export async function deleteUser(identifier: {
  email?: string;
  username?: string;
  id?: string;
  phoneNumber?: string;
}) {
  if (
    !identifier.email &&
    !identifier.username &&
    !identifier.id &&
    !identifier.phoneNumber
  ) {
    throw new Error(
      "At least one identifier (username, email, id, or phoneNumber) is required"
    );
  }

  return User.destroy({
    where: {
      [Op.or]: [
        identifier.email ? { email: identifier.email } : undefined,
        identifier.username ? { username: identifier.username } : undefined,
        identifier.id ? { id: identifier.id } : undefined,
        identifier.phoneNumber
          ? { phoneNumber: identifier.phoneNumber }
          : undefined,
      ].filter(Boolean) as any,
    },
  });
}
