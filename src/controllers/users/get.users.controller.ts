import { Request, Response } from "express";
import { User } from "../../models/User";
import { findByDynamicId } from "../../services/global/find.service";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { Profile } from "../../models/Profile";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { findAllUsers } from "../../services/user/findAll.user.service";

export async function getUsersController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
        "page",
        "pageSize",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc, page = 1, pageSize = 10 } = req.body;
      if (!req.user) {
        console.log("login is required");
        res.status(400).json({ error: "login is required" });
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
      console.log("Access to admin user's details is restricted");
      res
        .status(403)
        .json({ error: "Access to admin user's details is restricted" });
      return;
    }

    const noPasswordUser = { ...user.get() };
    delete noPasswordUser.password;
    res
      .status(200)
      .json({ user: noPasswordUser, profile: userProfile, status: "success" });
    return;
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Error fetching users:", error });
  }
}
