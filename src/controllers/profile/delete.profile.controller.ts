import { Request, Response } from "express";
import { deleteProfileByUserId } from "../../services/profile/delete.profile.service";

export async function deleteUserProfileController(req: Request, res: Response) {
  try {
    if (!req.body || !req.body.userId) {
      console.log("UserId is required");
      res.status(400).json({ error: "UserId is required" });
      return;
    }

    if (!req.user) {
      console.log("Unauthorized access attempt");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!req.user.isAdmin && req.user.id !== req.body.userId) {
      console.log("Forbidden access attempt");
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { deletedCount, user } = await deleteProfileByUserId(req.body.userId);

    if (deletedCount === 0) {
      console.log(`User: ${user?.username} doesn't have a profile`);
      res.status(404).json({
        error: "User's Profile not found",
        message: `User: ${user?.username} doesn't have a profile`,
      });
      return;
    }

    console.log(`User: ${user?.username}'s profile is being deleted`);
    res.status(200).json({
      message: `User: ${user?.username}'s profile is being deleted`,
      email: user?.email,
    });
    return;
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user:", error });
  }
}
