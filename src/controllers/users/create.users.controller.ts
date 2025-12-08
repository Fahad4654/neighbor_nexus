import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { createUser } from "../../services/user/create.user.service";

export async function createUserController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const reqBodyValidation = validateRequiredBody(req, res, [
        "username",
        "firstname",
        "lastname",
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
