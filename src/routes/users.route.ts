import { Router } from "express";
import {
  getUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
  getUsersByIdController,
} from "../controllers/users.controller";

const router = Router();

router.post("/all", getUsersController);
router.get("/:id", getUsersByIdController);
router.post("/", createUserController);
router.put("/", updateUserController);
router.delete("/", deleteUserController);

export { router as userCreateRouter };
export { router };
