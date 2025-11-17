import { Request, Response } from "express";
import {
  findAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service";
import { User } from "../models/User";
import { findByDynamicId } from "../services/find.service";
import { validateRequiredBody } from "../services/reqBodyValidation.service";
import { Profile } from "../models/Profile";

import { isAdmin } from "../middlewares/isAdmin.middleware";
import { Op } from "sequelize";
import {
  createTool,
  deleteTool,
  findAllTools,
  updateTool,
} from "../services/tool.service";
import { Tool } from "../models/Tools";

export async function getToolsController(req: Request, res: Response) {
  try {
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const reqBodyValidation = validateRequiredBody(req, res, ["order", "asc"]);
    if (!reqBodyValidation) return;

    const { order, asc, page = 1, pageSize = 10 } = req.body;
    if (!req.user) {
      console.log("User is required");
      res.status(400).json({ error: "User is required" });
      return;
    }

    const toolslist = await findAllTools(
      order,
      asc,
      Number(page),
      Number(pageSize),
      req.user?.id
    );
    console.log("Tools fetched successfully");
    console.log(
      "toolslist",
      toolslist.data.map((t) => t.get({ plain: true }))
    );
    res.status(200).json({
      message: "Tools fetched successfully",
      toolslist,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error fetching tools:", error);
    res.status(500).json({ message: "Error fetching tools", error });
  }
}

export async function getToolByListingIdController(
  req: Request,
  res: Response
) {
  try {
    const listing_id = req.params.listing_id;
    if (!listing_id) {
      res.status(400).json({
        status: 400,
        error:
          "listing_id is required as a route parameter (e.g., /tools/:listing_id)",
      });
      return;
    }

    const typedTool = await findByDynamicId(
      Tool,
      { listing_id: listing_id },
      false
    );
    const tool = typedTool as Tool | null;
    if (!tool) {
      console.log("Tool not found");
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    res.status(200).json({ Tool: tool, status: "success" });
    return;
  } catch (error) {
    console.error("Error finding tool:", error);
    res.status(500).json({ message: "Error fetching tool:", error });
  }
}

export async function createToolController(req: Request, res: Response) {
  try {
    const reqBodyValidation = validateRequiredBody(req, res, [
      "owner_id",
      "listing_type",
      "title",
      "description",
      "hourly_price",
      "daily_price",
      "security_deposit",
      "is_available",
    ]);
    if (!reqBodyValidation) return;

    const newTool = await createTool(req.body);

    res.status(201).json({
      message: "Tool created successfully",
      user: newTool.toJSON(),
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error creating tool:", error);
    res.status(500).json({ message: "Error creating tool:", error });
  }
}

export async function updateToolController(req: Request, res: Response) {
  try {
    if (!req.body.listing_id) {
      res.status(400).json({ error: "listing_id is required" });
      return;
    }
    const typedWantUpTool = await findByDynamicId(
      Tool,
      { listing_id: req.body.listing_id },
      false
    );
    const wantUpTool = typedWantUpTool as Tool | null;

    if (!req.user) {
      res.status(400).json({ error: "Login is required" });
      return;
    }
    if (!wantUpTool) {
      res.status(400).json({ error: "Tool Not found" });
      return;
    }
    if (!req.user.isAdmin) {
      if (req.user.id !== req.body.id && wantUpTool.owner_id !== req.user.id) {
        res
          .status(400)
          .json({ error: "only owner or admin can update this tool" });
        return;
      }
    }
    const updatedTool = await updateTool(req.body);

    if (!updatedTool) {
      console.log("No valid fields to update or tool not found");
      res
        .status(400)
        .json({ error: "No valid fields to update or tool not found" });
      return;
    }
    res.status(200).json({
      message: "Tool updated successfully",
      user: updatedTool,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error updating tool:", error);
    res.status(500).json({ message: "Error updating tool:", error });
  }
}

export async function deleteToolController(req: Request, res: Response) {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: "Provide listing_id of the tool" });
    }

    const typedWantDelTool = await findByDynamicId(Tool, { listing_id }, false);
    const wantDelTool = typedWantDelTool as Tool | null;
    if (!wantDelTool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    if (!req.user) {
      return res.status(400).json({ error: "Login is required" });
    }

    if (!req.user.isAdmin) {
      if (req.user.id !== wantDelTool.owner_id) {
        return res
          .status(403)
          .json({ error: "You are not permitted to delete this tool" });
      }
    }

    const deletedCount = await deleteTool(listing_id);

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Tool not found" });
    }

    res.status(200).json({
      message: "Tool deleted successfully",
      deleted: { Tool: wantDelTool },
      count: deletedCount,
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting tool:", error);
    res.status(500).json({ message: "Error deleting tool", error });
  }
}
