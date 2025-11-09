import { Router } from "express";
import {
  getUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
  getUsersByIdController,
  getUsersByRefController,
  userGameSummaryController,
} from "../controllers/users.controller";

const router = Router();

router.post("/all", getUsersController);
router.get("/:id", getUsersByIdController);
router.post("/byRef", getUsersByRefController);
router.post("/", createUserController);
router.put("/", updateUserController);
router.delete("/", deleteUserController);
router.get("/game-summary/:userId", userGameSummaryController);

export { router as userCreateRouter };
export { router };
