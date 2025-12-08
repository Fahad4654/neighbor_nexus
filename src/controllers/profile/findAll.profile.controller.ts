import { Request, Response } from "express";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { findAllProfiles } from "../../services/profile/findAll.profile.service";

export async function getUsersProfileController(req: Request, res: Response) {
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
      ]);
      if (!reqBodyValidation) return;

      const { order, asc, page = 1, pageSize = 10 } = req.body;

      const profiles = await findAllProfiles(
        order,
        asc,
        Number(page),
        Number(pageSize)
      );

      res.status(200).json({
        message: "User Profile fetched successfully",
        profilelist: profiles,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile", error });
    }
  });
}
