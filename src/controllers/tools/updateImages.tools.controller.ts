// updateImages.tools.controller.ts
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
} from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateToolImagesController = asyncHandler(async (req: Request, res: Response) => {
  // 💡 CHANGE 1: Destructure new fields for primary image control
  const {
    listing_id,
    remove_image_ids,
    new_primary_id,
    set_first_new_file_as_primary,
  } = req.body;

  // Check if the user specifically requested the first new file to be primary
  // 💡 FIX 1: Calculate this flag early, as it affects the deletion logic
  const isNewFilePrimaryRequested =
    set_first_new_file_as_primary === "true" ||
    set_first_new_file_as_primary === true;

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

  // --- Parse remove_image_ids ---
  let removeImageIds: string[] = [];
  if (remove_image_ids) {
    try {
      // Handle both JSON string array and comma-separated string
      if (typeof remove_image_ids === "string") {
        removeImageIds = remove_image_ids.startsWith("[")
          ? JSON.parse(remove_image_ids)
          : remove_image_ids
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
      } else if (Array.isArray(remove_image_ids)) {
        removeImageIds = removeImageIds;
      }
    } catch (e) {
      return errorResponse(
        res,
        "Invalid remove_image_ids format",
        "remove_image_ids must be an array of IDs, JSON string, or comma-separated string.",
        400
      );
    }

    if (
      removeImageIds.some((id) => typeof id !== "string" || id.length === 0)
    ) {
      return errorResponse(
        res,
        "Invalid remove_image_ids content",
        "remove_image_ids must contain valid image IDs",
        400
      );
    }
  }

  // --- Primary Image Change (Existing Image) - Requirement 1 ---
  if (new_primary_id) {
    const newPrimaryImage = await ToolImage.findOne({
      where: { id: new_primary_id, tool_id: listing_id }, // Ensure it belongs to the tool
    });

    if (!newPrimaryImage) {
      return errorResponse(
        res,
        "Invalid Image ID",
        `Image with ID ${new_primary_id} not found or does not belong to the tool.`,
        400
      );
    }

    // 1. Unset current primary image (Requirement 1 & 2 logic starts here)
    await ToolImage.update(
      { is_primary: false },
      { where: { tool_id: listing_id, is_primary: true } }
    );

    // 2. Set the new primary image
    await newPrimaryImage.update({ is_primary: true });
  }

  // --- Image Deletion - Requirement 3 ---
  if (removeImageIds.length > 0) {
    const defaultImagePath = path.join(
      process.cwd(),
      "media/tools/default.png"
    );

    // 💡 FIX (Requirement 3): Find images scoped to the listing_id
    const imagesToRemove = await ToolImage.findAll({
      where: { id: { [Op.in]: removeImageIds }, tool_id: listing_id }, // FIX: Scoped by tool_id
    });

    // NEW SECURITY CHECK: Compare requested IDs vs. found/authorized IDs
    if (imagesToRemove.length !== removeImageIds.length) {
      const foundIds = new Set(imagesToRemove.map(img => img.id));
      const unauthorizedIds = removeImageIds.filter(id => !foundIds.has(id));

      return errorResponse(
          res,
          "Image Security Breach",
          `One or more image IDs (${unauthorizedIds.join(', ')}) do not belong to tool ID ${listing_id} or do not exist.`,
          403 // Forbidden access
      );
    }
    
    // Check if deleting these images would leave the tool without a primary image
    const potentialPrimaryImage = await ToolImage.findOne({
      where: {
        tool_id: listing_id,
        is_primary: true,
        id: { [Op.notIn]: imagesToRemove.map((img) => img.id) }, // Exclude images being removed
      },
    });

    // 💡 FIX 2: Block deletion only if NO replacement is designated (neither existing ID nor new upload flag)
    if (!potentialPrimaryImage && !new_primary_id && !isNewFilePrimaryRequested) {
      return errorResponse(
        res,
        "Deletion Blocked",
        "Cannot delete the current primary image unless a replacement primary image (new_primary_id or set_first_new_file_as_primary) is set.",
        400
      );
    }

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
    // 💡 FIX (Requirement 3): Destroy images scoped to the listing_id
    await ToolImage.destroy({
      where: { id: { [Op.in]: removeImageIds }, tool_id: listing_id },
    }); // FIX: Scoped by tool_id
  }

  // --- New Image Upload - Requirement 2 ---
  if (req.files && Array.isArray(req.files)) {
    const newFiles = req.files as Express.Multer.File[];
    const currentCount = await ToolImage.count({
      where: { tool_id: tool.listing_id },
    });
    const newFilesCount = newFiles.length;

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
    
    // 💡 CHANGE 3 (Requirement 2): Unset old primary if a new file is becoming primary AND no existing ID was used
    // NOTE: This runs BEFORE file creation, which is necessary if we are deleting the old primary.
    if (isNewFilePrimaryRequested && newFiles.length > 0 && !new_primary_id) {
      await ToolImage.update(
        { is_primary: false },
        { where: { tool_id: listing_id, is_primary: true } }
      );
    }

    for (const [index, file] of newFiles.entries()) {
      const savedUrl = saveFile(
        tool.listing_id,
        file.buffer,
        "tools",
        file.originalname
      );

      let is_primary = false;

      // 💡 CHANGE 4: Set as primary if requested AND this is the first file being uploaded
      if (isNewFilePrimaryRequested && index === 0) {
        is_primary = true;
      }
      // 💡 FALLBACK: If the tool had NO images (count=0) AND no new_primary_id was set, make the first new image primary
      else if (currentCount === 0 && index === 0 && !new_primary_id) {
        is_primary = true;
      }

      await ToolImage.create({
        tool_id: tool.listing_id,
        image_url: savedUrl,
        filepath: path.join(rootDir, savedUrl),
        is_primary: is_primary,
      });
    }
  }

  // --- Final Primary Image Check (Ensures a primary image exists) ---
  const finalPrimaryCount = await ToolImage.count({
    where: { tool_id: listing_id, is_primary: true },
  });

  // If after all operations, no primary image exists, set the oldest remaining image as primary
  if (finalPrimaryCount === 0) {
    const anyRemainingImage = await ToolImage.findOne({
      where: { tool_id: listing_id },
      order: [["createdAt", "ASC"]],
    });
    if (anyRemainingImage) {
      await anyRemainingImage.update({ is_primary: true });
    }
  }

  const updatedTool = await findToolsByListingId(listing_id);

  return successResponse(
    res,
    "Tool images updated successfully",
    { data: updatedTool },
    200
  );
}, "Error updating tool images");