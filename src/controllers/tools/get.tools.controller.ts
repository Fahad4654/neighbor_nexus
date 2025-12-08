import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { User } from "../../models/User";
import {
  findAllTools,
  findToolsByListingId,
  findToolsByOwnerId,
} from "../../services/tools/find.tool.service";

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

    const ownerExists = await findByDynamicId(User, { id: owner_id }, false);
    const owner = ownerExists as User | null;
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
