import { Request, Response } from "express";
import { saveFile } from "../../middlewares/upload";
import { updateProfileByUserId } from "../../services/profile/update.profile.service";

export async function uploadProfilePictureController(
  req: Request,
  res: Response
) {
  try {
    // VALIDATION
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    if (!req.body.userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    if (!req.user) {
      console.log("Unauthorized access attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.isAdmin && req.user.id !== req.body.userId) {
      console.log("Forbidden access attempt");
      return res.status(403).json({ error: "Forbidden" });
    }

    //DO NOT SAVE FILE YET
    // create a temporary avatarUrl but DO NOT write the file
    const tempAvatarUrl = `/media/profile/temp-${Date.now()}.jpg`;

    // Try the database update FIRST
    const updatedProfile = await updateProfileByUserId(req.body.userId, {
      avatarUrl: tempAvatarUrl, // temp placeholder
    });

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found or update failed",
      });
    }

    // SAVE FILE ONLY AFTER SUCCESS
    const finalAvatarUrl = saveFile(
      req.user.id,
      req.file.buffer,
      "profile",
      req.file.originalname
    );

    // Update profile again with actual URL
    const profile = await updateProfileByUserId(req.body.userId, {
      avatarUrl: finalAvatarUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profile: profile,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
