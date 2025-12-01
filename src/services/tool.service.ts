import { User } from "../models/User";
import { findByDynamicId } from "./find.service";
import { Tool } from "../models/Tools";
import { ToolImage } from "../models/ToolsImages";
import e from "express";

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
        attributes: [
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
          "geo_location",
        ],
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

export async function findToolsByOwnerId(owner_id: string) {
  const tools = await Tool.findAll({
    where: { owner_id },
    include: [
      {
        model: User,
        as: "owner",
        attributes: [
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
          "geo_location",
        ],
      },
      {
        model: ToolImage,
        as: "images",
        attributes: { exclude: ["createdAt", "updatedAt", "filepath"] },
      },
    ],
  });
  return tools;
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

export async function updateTool(
  data: Partial<Tool> & {
    listing_id: string;
    remove_image_ids?: string[];
    new_images?: Express.Multer.File[];
  }
) {
  const tool = await Tool.findOne({
    where: { listing_id: data.listing_id },
    include: [{ model: ToolImage, as: "images" }],
  });
  if (!tool) throw new Error("Tool not found");

  // Update normal fields
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

  if (Object.keys(updates).length > 0) {
    await tool.update(updates);
  }

  // Remove images
  if (data.remove_image_ids && data.remove_image_ids.length > 0) {
    const { unlink } = await import("fs/promises");
    for (const imgId of data.remove_image_ids) {
      const img = await ToolImage.findByPk(imgId);
      if (img) {
        try {
          await unlink(img.filepath); // delete from media
        } catch (err) {
          console.warn(`Failed to delete file ${img.filepath}:`, err);
        }
        await img.destroy();
      }
    }
  }

  // Add new images
  if (data.new_images && data.new_images.length > 0) {
    if (tool.images.length + data.new_images.length > 5) {
      throw new Error("A tool can have a maximum of 5 images");
    }

    const createdImages = [];
    for (const file of data.new_images) {
      const newImg = await ToolImage.create({
        tool_id: tool.listing_id,
        image_url: `/media/tools/${file.filename}`,
        filepath: file.path,
        is_primary: false,
      });
      createdImages.push(newImg);
    }
  }

  return Tool.findByPk(tool.listing_id, {
    include: [
      {
        model: User,
        as: "owner",
        attributes: [
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
          "geo_location",
        ],
      },
      {
        model: ToolImage,
        as: "images",
        attributes: {
          exclude: ["tool_id", "createdAt", "updatedAt", "filepath"],
        },
      },
    ],
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
