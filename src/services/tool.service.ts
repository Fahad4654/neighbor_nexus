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
import { ToolImage } from "../models/ToolsImages";

const mailService = new MailService();

export const generateToken = (id: string): string => {
  return id.slice(-9).toUpperCase(); // Take last 9 chars and uppercase
};

export async function findAllTools(
  order = "createdAt",
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
    where: whereClause,
    include: [
      { model: User, as: "owner" },
      { model: ToolImage, as: "images" }, // ✅ include images
    ],
    nest: true,
    raw: false,
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

export async function createTool(
  data: {
    owner_id: string;
    listing_type: string;
    title: string;
    description?: string;
    hourly_price?: number;
    daily_price?: number;
    security_deposit?: number;
    is_available?: boolean;
  },
  imageUrls: string[] = []
) {
  const newTool = await Tool.create({
    owner_id: data.owner_id,
    listing_type: data.listing_type as "Tool" | "Skill",
    title: data.title,
    description: data.description,
    hourly_price: data.hourly_price,
    daily_price: data.daily_price,
    security_deposit: data.security_deposit,
    is_available: data.is_available ?? true,
  });

  // Save images
  if (imageUrls.length > 0) {
    const imageRecords = imageUrls.map((url) => ({
      tool_id: newTool.listing_id,
      image_url: url,
    }));

    await ToolImage.bulkCreate(imageRecords);
  }

  return Tool.findByPk(newTool.listing_id, {
    include: [{ model: ToolImage, as: "images" }],
  });
}

export async function updateTool(data: Partial<Tool> & { listing_id: string }) {
  const UpdateTool = await Tool.findOne({
    where: { listing_id: data.listing_id },
  });
  if (!UpdateTool) {
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
    "images",
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

export async function deleteTool(listing_id: string) {
  if (!listing_id) throw new Error("listing_id is required");

  await ToolImage.destroy({ where: { tool_id: listing_id } });

  return Tool.destroy({ where: { listing_id } });
}

export async function addImagesToTool(listing_id: string, imageUrls: string[]) {
  if (!imageUrls.length) return;

  const toInsert = imageUrls.map((url) => ({
    tool_id: listing_id,
    image_url: url,
  }));

  return ToolImage.bulkCreate(toInsert);
}
