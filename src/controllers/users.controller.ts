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
import { isAdminOrAgent } from "../middlewares/isAgentOrAdmin.middleware";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { Op } from "sequelize";
import { userGameSummary } from "../services/userGameSummary.service";

export async function getUsersController(req: Request, res: Response) {
  const agentOrAdminMiddleware = isAdminOrAgent();

  agentOrAdminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc, page = 1, pageSize = 10 } = req.body;
      if (!req.user) {
        console.log("User is required");
        res.status(400).json({ error: "User is required" });
        return;
      }

      const usersList = await findAllUsers(
        order,
        asc,
        Number(page),
        Number(pageSize),
        req.user?.id
      );
      console.log("User fetched successfully");
      console.log("usersList", usersList);
      res.status(200).json({
        message: "User fetched successfully",
        usersList,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error });
    }
  });
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

    console.log("User found:", user);
    res.status(200).json({ user: user, status: "success" });
    return;
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Error fetching users:", error });
  }
}

export async function createUserController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const reqBodyValidation = validateRequiredBody(req, res, [
        "name",
        "email",
        "password",
        "phoneNumber",
      ]);
      if (!reqBodyValidation) return;

      const newUser = await createUser(req.body);
      const { password, ...userWithoutPassword } = newUser.toJSON();

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating users:", error });
    }
  });
}

export async function updateUserController(req: Request, res: Response) {
  try {
    if (!req.body.id) {
      res.status(400).json({ error: "UserId is required" });
      return;
    }
    const typedWantUpUser = await findByDynamicId(
      User,
      { id: req.body.id },
      false
    );
    const wantUpUser = typedWantUpUser as User | null;

    if (!req.user) {
      res.status(400).json({ error: "Login is required" });
      return;
    }
    if (!wantUpUser) {
      res.status(400).json({ error: "User Not found" });
      return;
    }
    if (!req.user.isAdmin) {
      if (req.user.id !== req.body.id && wantUpUser.createdBy !== req.user.id) {
        res
          .status(400)
          .json({ error: "You are not permitted to update this user" });
        return;
      }
    }
    const updatedUser = await updateUser(req.body);

    if (!updatedUser) {
      console.log("No valid fields to update or user not found");
      res
        .status(400)
        .json({ error: "No valid fields to update or user not found" });
      return;
    }

    console.log("User updated successfully", updatedUser);
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating users:", error });
  }
}

export async function deleteUserController(req: Request, res: Response) {
  const agentOrAdminMiddleware = isAdminOrAgent();

  agentOrAdminMiddleware(req, res, async () => {
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

      const wantUpUser = await User.findOne({ where: whereClause });
      if (!wantUpUser) {
        return res
          .status(404)
          .json({ error: "User not found or identifiers mismatch" });
      }

      if (!req.user) {
        return res.status(400).json({ error: "Login is required" });
      }

      if (!req.user.isAdmin) {
        if (
          req.user.id !== wantUpUser.id &&
          wantUpUser.createdBy !== req.user.id
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
  });
}

export async function getUsersByRefController(req: Request, res: Response) {
  try {
    const playerId = req.body.ref;
    if (!playerId) {
      res.status(400).json({
        status: 400,
        error: "Referral Code is required",
      });
      return;
    }

    const foundtypedProfile = await findByDynamicId(
      Profile,
      { playerId },
      false
    );
    const foundProfile = foundtypedProfile as Profile | null;
    if (!foundProfile) {
      res.status(400).json({
        status: 400,
        error: "Referral Code is not valid",
      });
      return;
    }
    // const user = await findByDynamicId(User, { id: foundProfile.userId }, false);
    const foundtypedUser = await findByDynamicId(
      User,
      { id: foundProfile.userId },
      false
    );
    const user = foundtypedUser as User | null;
    if (!user) {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log("User found:", user);
    res.status(200).json({ user: user, status: "success" });
    return;
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Error fetching users:", error });
  }
}

export async function userGameSummaryController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    if (!req.user?.isAdmin && !req.user?.isAgent && userId !== req.user?.id) {
      res.status(400).json({ error: "Permission denied" });
      return;
    }
    const summary = await userGameSummary(userId);

    res.status(200).json({
      message: "User game summary fetched successfully",
      data: summary,
    });
    return;
  } catch (error) {
    console.error("Error fetching user game summary:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : error,
    });
    return;
  }
}
