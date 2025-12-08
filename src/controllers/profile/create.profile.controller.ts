import { Request, Response } from "express";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { createProfile } from "../../services/profile/create.profile.service";

export async function createUserProfileController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "userId",
        "bio",
        "avatarUrl",
        "address",
      ]);
      if (!reqBodyValidation) return;

      const newProfile = await createProfile(req.body);

      console.log("User profile created successfully", newProfile);
      res.status(201).json({
        message: "User profile created successfully",
        profile: newProfile,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(500).json({ message: "Error creating user profile", error });
    }
  });
}
