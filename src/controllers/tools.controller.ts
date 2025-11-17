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
import { createTool, findAllTools, updateTool } from "../services/tool.service";
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

export async function getUsersByIdController(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({
        status: 400,
        error: "User ID is required as a route parameter (e.g., /users/:id)",
      });
      return;
    }

    const typedUser = await findByDynamicId(User, { id: userId }, false);
    const user = typedUser as User | null;
    console.log(user);
    if (!user) {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
      return;
    }
    const typedUserProfile = await findByDynamicId(
      Profile,
      { userId: user.id },
      false
    );
    const userProfile = typedUserProfile as Profile | null;
    if (!userProfile) {
      console.log("User profile not found");
      res.status(404).json({ error: "User profile not found" });
      return;
    }
    if (user && user.isAdmin && !req.user?.isAdmin) {
      console.log("Access to admin user details is restricted");
      res
        .status(403)
        .json({ error: "Access to admin user details is restricted" });
      return;
    }

    console.log("User found:", user);
    console.log("Profile found:", userProfile);
    res
      .status(200)
      .json({ user: user, profile: userProfile, status: "success" });
    return;
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Error fetching users:", error });
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

    console.log("Tool updated successfully", updatedTool);
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

export async function deleteUserController(req: Request, res: Response) {
  try {
    const { email, id, phoneNumber } = req.body;

    if (!email && !id && !phoneNumber) {
      return res
        .status(400)
        .json({ error: "Provide email, id, or phoneNumber" });
    }

    const whereClause: any = {
      [Op.or]: [
        id ? { id } : null,
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    };

    const wantDelUser = await User.findOne({ where: whereClause });
    if (!wantDelUser) {
      return res
        .status(404)
        .json({ error: "User not found or identifiers mismatch" });
    }

    if (!req.user) {
      return res.status(400).json({ error: "Login is required" });
    }

    if (!req.user.isAdmin) {
      if (
        req.user.id !== wantDelUser.id &&
        wantDelUser.createdBy !== req.user.id
      ) {
        return res
          .status(403)
          .json({ error: "You are not permitted to delete this user" });
      }
    }

    const deletedCount = await deleteUser({ email, id, phoneNumber });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      deleted: { email, id, phoneNumber },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
}
