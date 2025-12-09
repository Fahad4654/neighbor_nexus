import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { isAdmin } from "../../middlewares/isAdmin.middleware";
import { createUser } from "../../services/user/create.user.service";
import { successResponse, handleUncaughtError } from "../../utils/apiResponse";

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

      return successResponse(
        res,
        "User created successfully",
        { user: userWithoutPassword },
        201
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return handleUncaughtError(res, error, "Error creating user");
    }
  });
}
