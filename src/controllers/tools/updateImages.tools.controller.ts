import { Op } from "sequelize";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { findByDynamicId } from "../../services/global/find.service";
import { Tool } from "../../models/Tools";
import { ToolImage } from "../../models/ToolsImages";
import { saveFile } from "../../middlewares/upload";
import { findToolsByListingId } from "../../services/tools/find.tool.service";
import {
  successResponse,
  errorResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

export async function updateToolImagesController(req: Request, res: Response) {
  try {
    const { listing_id, remove_image_ids } = req.body;

    if (!listing_id)
      return errorResponse(
        res,
        "Tool ID is required",
        "Missing listing_id in request body",
        400
      );

    const tool = (await findByDynamicId(
      Tool,
      { listing_id },
      false
    )) as Tool | null;
    if (!tool)
      return errorResponse(
        res,
        "Tool not found",
        `Tool with ID ${listing_id} does not exist`,
        404
      );

    if (!req.user)
      return errorResponse(res, "Login required", "Unauthorized access", 401);

    if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
      return errorResponse(
        res,
        "Forbidden",
        "Only owner or admin can modify images",
        403
      );
    }

    let removeImageIds: string[] = [];
    if (remove_image_ids) {
      try {
        removeImageIds = Array.isArray(remove_image_ids)
          ? remove_image_ids
          : JSON.parse(remove_image_ids);
      } catch (e) {
        return errorResponse(
          res,
          "Invalid remove_image_ids format",
          "remove_image_ids must be a JSON array of IDs or a standard array",
          400
        );
      }
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
            const filePath = path.resolve(img.filepath);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.warn(`Failed to delete file ${img.filepath}:`, err);
          }
        }
      }
      await ToolImage.destroy({ where: { id: { [Op.in]: removeImageIds } } });
    }

    if (req.files && Array.isArray(req.files)) {
      const currentCount = await ToolImage.count({
        where: { tool_id: tool.listing_id },
      });
      const newFilesCount = (req.files as Express.Multer.File[]).length;

      const MAX_IMAGES = 5;
      if (currentCount + newFilesCount > MAX_IMAGES) {
        return errorResponse(
          res,
          "Image Upload Limit Reached",
          `Cannot upload ${newFilesCount} images. Tool already has ${currentCount}. Max is ${MAX_IMAGES}.`,
          400
        );
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
          image_url: savedUrl,
          filepath: path.join(rootDir, savedUrl),
          is_primary: currentCount + index === 0,
        });
      }
    }

    const updatedTool = await findToolsByListingId(listing_id);

    return successResponse(
      res,
      "Tool images updated successfully",
      { data: updatedTool },
      200
    );
  } catch (error) {
    console.error("Error updating tool images:", error);
    return handleUncaughtError(res, error, "Error updating tool images");
  }
}
