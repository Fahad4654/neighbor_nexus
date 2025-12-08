import { Request, Response } from "express";
import { User } from "../../models/User";
import { Op } from "sequelize";
import { ADMIN_USERNAME } from "../../config";
import { deleteUser } from "../../services/user/delete.user.service";

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
    if (wantDelUser.username === ADMIN_USERNAME) {
      console.log("Cannot delete main admin user");
      return res.status(403).json({ error: "Cannot delete main admin user" });
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
