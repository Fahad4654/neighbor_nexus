import { Router } from "express";
import { createUserController } from "../controllers/users/create.users.controller";
import { deleteUserController } from "../controllers/users/delete.users.controller";
import {
  getUsersController,
  getUsersByIdController,
} from "../controllers/users/get.users.controller";
import { updateUserController } from "../controllers/users/update.users.controller";

const router = Router();

router.post("/all", getUsersController);
router.get("/:id", getUsersByIdController);
router.post("/", createUserController);
router.put("/", updateUserController);
router.delete("/", deleteUserController);

export { router as userCreateRouter };
export { router };
