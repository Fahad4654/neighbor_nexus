import { Request, Response } from "express";
import { User } from "../../models/User";
import { findByDynamicId } from "../../services/global/find.service";
import { updateUser } from "../../services/user/update.user.service";

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
    if (req.body.isAdmin && !req.user.isAdmin) {
      res.status(400).json({ error: "Only admins can grant admin privileges" });
      return;
    }

    if (req.body.isVerified && !req.user.isAdmin) {
      res.status(400).json({ error: "Only admins can verify user accounts" });
      return;
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
