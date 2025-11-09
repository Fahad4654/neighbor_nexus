import { Router } from "express";
import {
  getUsersProfileController,
  createUserProfileController,
  updateUserProfileController,
  deleteUserProfileController,
  uploadProfilePictureController,
} from "../controllers/userProfile.controller";
import { uploadSingle } from "../middlewares/upload";

const router = Router();

router.post("/all", getUsersProfileController);
router.post("/", createUserProfileController);
router.put("/", updateUserProfileController);
router.delete("/", deleteUserProfileController);

router.post("/upload-avatar", uploadSingle, uploadProfilePictureController);

export { router as userCreateRouter };
export { router };
