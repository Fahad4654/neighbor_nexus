import { Router } from "express";
import {
  getUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
  getUsersByIdController,
  getUsersByRefController
} from "../controllers/users.controller";

const router = Router();

router.post("/all", getUsersController);
router.get("/:id", getUsersByIdController);
router.post("/byRef", getUsersByRefController);
router.post("/", createUserController);
router.put("/", updateUserController);
router.delete("/", deleteUserController);


export { router as userCreateRouter };
export { router };
