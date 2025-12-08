import { Router } from "express";
import {
  getUsersController,
  getUsersByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
} from "../controllers/users/users.controller";

const router = Router();

router.post("/all", getUsersController);
router.get("/:id", getUsersByIdController);
router.post("/", createUserController);
router.put("/", updateUserController);
router.delete("/", deleteUserController);

export { router as userCreateRouter };
export { router };
