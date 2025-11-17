import { Router } from "express";

import {
  createToolController,
  getToolsController,
  updateToolController,
} from "../controllers/tools.controller";

const router = Router();

router.post("/all", getToolsController);
// router.get("/:id", getUsersByIdControll);
router.post("/", createToolController);
router.put("/", updateToolController);
// router.delete("/", deleteUserController);

export { router as userCreateRouter };
export { router };
