import { Request, Response } from "express";
import fs from "fs";
import { findByDynamicId } from "../services/find.service";
import { validateRequiredBody } from "../services/reqBodyValidation.service";
import {
  createTool,
  deleteTool,
  findAllTools,
  findToolsByListingId,
  findToolsByOwnerId,
  updateTool,
} from "../services/tool.service";
import { Tool } from "../models/Tools";
import { ToolImage } from "../models/ToolsImages";
import { User } from "../models/User";

// ✅ Get all tools with pagination
export async function getToolsController(req: Request, res: Response) {
  try {
    const reqBodyValidation = validateRequiredBody(req, res, ["order", "asc"]);
    if (!reqBodyValidation) return;

    if (!req.user) {
      return res.status(401).json({ error: "User is required" });
    }

    const { order, asc, page = 1, pageSize = 10 } = req.body;

    const toolsList = await findAllTools(
      order,
      asc,
      Number(page),
      Number(pageSize),
      req.user.id
    );

    res.status(200).json({
      message: "Tools fetched successfully",
      data: toolsList.data.map((t) => t.get({ plain: true })),
      pagination: toolsList.pagination,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching tools:", error);
    res.status(500).json({ message: "Error fetching tools", error });
  }
}

// ✅ Get single tool by listing_id
export async function getToolByListingIdController(
  req: Request,
  res: Response
) {
  try {
    const { listing_id } = req.params;

    const tool = await findToolsByListingId(listing_id);

    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    res.status(200).json({
      message: "Tool fetched successfully",
      data: tool.get({ plain: true }),
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching tool by listing_id:", error);
    res.status(500).json({ message: "Error fetching tool", error });
  }
}

// Get tools by owner_id
export async function getToolsByOwnerIdController(req: Request, res: Response) {
  try {
    const { owner_id } = req.params;

    if (!owner_id) {
      res.status(400).json({ error: "owner_id is required" });
      return;
    }

    const ownerExists = await findByDynamicId(User, { id:owner_id }, false);
    const owner = ownerExists as User | null;
    console.log("--------",owner);
    if (!owner) {
      res.status(404).json({ error: "Owner not found" });
      return;
    }

    const tools = await findToolsByOwnerId(owner.id);
    res.status(200).json({
      message: "Tools fetched successfully",
      data: tools.map((t) => t.get({ plain: true })),
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching tools by owner_id:", error);
    res.status(500).json({ message: "Error fetching tools", error });
  }
}

// ✅ Create new tool
export async function createToolController(req: Request, res: Response) {
  try {
    const requiredFields = ["owner_id", "listing_type", "title"];
    const reqBodyValidation = validateRequiredBody(req, res, requiredFields);
    if (!reqBodyValidation) return;

    const newTool = await createTool(req.body);

    res.status(201).json({
      message: "Tool created successfully",
      data: newTool,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating tool:", error);
    res.status(500).json({ message: "Error creating tool", error });
  }
}

// ✅ Update existing tool
export async function updateToolController(req: Request, res: Response) {
  try {
    const { listing_id, remove_image_ids } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: "listing_id is required" });
    }

    const typedTool = await findByDynamicId(Tool, { listing_id }, false);
    const tool = typedTool as Tool | null;
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    if (!req.user) {
      return res.status(400).json({ error: "Login is required" });
    }

    if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
      return res
        .status(403)
        .json({ error: "Only owner or admin can update this tool" });
    }

    // ----------------------------
    // Handle removal of images
    // ----------------------------
    let removeImageIds: string[] = [];
    if (remove_image_ids) {
      try {
        removeImageIds = Array.isArray(remove_image_ids)
          ? remove_image_ids
          : JSON.parse(remove_image_ids);
      } catch {
        return res
          .status(400)
          .json({ error: "Invalid remove_image_ids format" });
      }

      if (removeImageIds.length > 0) {
        const imagesToRemove = await ToolImage.findAll({
          where: { id: removeImageIds },
        });

        for (const img of imagesToRemove) {
          if (img.filepath && fs.existsSync(img.filepath)) {
            fs.unlinkSync(img.filepath);
          }
        }

        await ToolImage.destroy({ where: { id: removeImageIds } });
      }
    }

    // ----------------------------
    // Handle new uploads
    // ----------------------------
    if (req.files && Array.isArray(req.files)) {
      const currentImagesCount = await ToolImage.count({
        where: { tool_id: tool.listing_id },
      });
      const newFilesCount = (req.files as Express.Multer.File[]).length;

      if (currentImagesCount + newFilesCount > 5) {
        return res.status(400).json({
          success: false,
          message: `Cannot upload ${newFilesCount} images. Tool already has ${currentImagesCount} images. Maximum allowed is 5.`,
        });
      }

      for (const [index, file] of (
        req.files as Express.Multer.File[]
      ).entries()) {
        await ToolImage.create({
          tool_id: tool.listing_id,
          image_url: file.filename, // or full URL if uploading to S3/Cloudinary
          filepath: file.path,
          is_primary: currentImagesCount + index === 0, // first image is primary
        });
      }
    }

    // ----------------------------
    // Update tool info
    // ----------------------------
    const updatedTool = await updateTool(req.body);

    res.status(200).json({
      message: "Tool updated successfully",
      tool: updatedTool,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating tool:", error);
    res.status(500).json({ message: "Error updating tool", error });
  }
}

// ✅ Delete tool
export async function deleteToolController(req: Request, res: Response) {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: "Provide listing_id of the tool" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Login is required" });
    }

    const tool = (await findByDynamicId(
      Tool,
      { listing_id },
      false
    )) as Tool | null;
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
      return res
        .status(403)
        .json({ error: "You are not permitted to delete this tool" });
    }

    const deletedCount = await deleteTool(listing_id);

    res.status(200).json({
      message: "Tool deleted successfully",
      data: tool,
      deletedCount,
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting tool:", error);
    res.status(500).json({ message: "Error deleting tool", error });
  }
}
