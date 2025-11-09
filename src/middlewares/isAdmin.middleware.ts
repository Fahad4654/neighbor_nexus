import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

// Updated isAdmin middleware (reusable for controllers)
export const isAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // If admin, proceed to the controller logic
      next();
    } catch (error) {
      console.error("Admin check error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
