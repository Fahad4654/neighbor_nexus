import { User } from "../../models/User";
import { Tool } from "../../models/Tools";
import { ToolImage } from "../../models/ToolsImages";

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
