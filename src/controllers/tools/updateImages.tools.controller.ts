import { Op } from "sequelize";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { findByDynamicId } from "../../services/global/find.service";
import { Tool } from "../../models/Tools";
import { ToolImage } from "../../models/ToolsImages";
import { saveFile } from "../../middlewares/upload";
import {
  findAllTools,
  findToolsByListingId,
  findToolsByOwnerId,
} from "../../services/tools/find.tool.service";

export async function updateToolImagesController(req: Request, res: Response) {
  try {
    const { listing_id, remove_image_ids } = req.body;

    if (!listing_id)
      return res.status(400).json({ error: "listing_id is required" });

    const tool = (await findByDynamicId(
      Tool,
      { listing_id },
      false
    )) as Tool | null;
    if (!tool) return res.status(404).json({ error: "Tool not found" });

    if (!req.user) return res.status(401).json({ error: "Login required" });
    if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
      return res
        .status(403)
        .json({ error: "Only owner or admin can modify images" });
    }

    // Remove images
    let removeImageIds: string[] = [];
    if (remove_image_ids) {
      removeImageIds = Array.isArray(remove_image_ids)
        ? remove_image_ids
        : JSON.parse(remove_image_ids);
    }

    if (removeImageIds.length > 0) {
      const defaultImagePath = path.join(
        process.cwd(),
        "media/tools/default.png"
      );
      const imagesToRemove = await ToolImage.findAll({
        where: { id: { [Op.in]: removeImageIds } },
      });
      for (const img of imagesToRemove) {
        if (img.filepath && img.filepath !== defaultImagePath) {
          try {
            const filePath = path.resolve(img.filepath); // resolve to absolute path
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath); // delete file from server
            }
          } catch (err) {
            console.warn(`Failed to delete file ${img.filepath}:`, err);
          }
        }
      }
      await ToolImage.destroy({ where: { id: { [Op.in]: removeImageIds } } });
    }

    // Add new images
    if (req.files && Array.isArray(req.files)) {
      const currentCount = await ToolImage.count({
        where: { tool_id: tool.listing_id },
      });
      const newFilesCount = (req.files as Express.Multer.File[]).length;

      if (currentCount + newFilesCount > 5) {
        return res.status(400).json({
          error: `Cannot upload ${newFilesCount} images. Tool already has ${currentCount}. Max is 5.`,
        });
      }
      const rootDir = process.cwd();

      for (const [index, file] of (
        req.files as Express.Multer.File[]
      ).entries()) {
        const savedUrl = saveFile(
          tool.listing_id,
          file.buffer,
          "tools",
          file.originalname
        );

        await ToolImage.create({
          tool_id: tool.listing_id,
          image_url: savedUrl, // relative URL for frontend
          filepath: path.join(rootDir, savedUrl), // absolute path for deletion
          is_primary: currentCount + index === 0,
        });
      }
    }

    const updatedTool = await findToolsByListingId(listing_id);

    res.status(200).json({
      message: "Tool images updated successfully",
      data: updatedTool,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating tool images:", error);
    res.status(500).json({ message: "Error updating tool images", error });
  }
}
