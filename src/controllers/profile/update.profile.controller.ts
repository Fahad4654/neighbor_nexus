import { Request, Response } from "express";
import { updateProfileByUserId } from "../../services/profile/update.profile.service";

export async function updateUserProfileController(req: Request, res: Response) {
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

    const updatedProfile = await updateProfileByUserId(
      req.body.userId,
      req.body
    );

    if (!updatedProfile) {
      console.log("No valid fields provided for update or profile not found");
      res.status(400).json({
        error: "No valid fields provided for update or profile not found",
      });
      return;
    }

    console.log("Profile updated successfully", updatedProfile);
    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : error,
    });
  }
}