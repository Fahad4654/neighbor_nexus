import { Router } from "express";

import {
  createToolController,
  getToolsController,
} from "../controllers/tools.controller";

const router = Router();

router.post("/all", getToolsController);
// router.get("/:id", getUsersByIdControll);
router.post("/", createToolController);
// router.put("/", updateUserController);
// router.delete("/", deleteUserController);

export { router as userCreateRouter };
export { router };
