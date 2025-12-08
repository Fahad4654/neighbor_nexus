import { Router } from "express";
import {
  getUsersProfileController,
  createUserProfileController,
  updateUserProfileController,
  deleteUserProfileController,
  uploadProfilePictureController,
} from "../controllers/profile/userProfile.controller";
import { multerErrorHandler, uploadProfilePic } from "../middlewares/upload";

const router = Router();

router.post("/all", getUsersProfileController);
router.post("/", createUserProfileController);
router.put("/", updateUserProfileController);
router.delete("/", deleteUserProfileController);

router.post(
  "/upload-avatar",
  uploadProfilePic, // Multer middleware (memory storage)
  multerErrorHandler, // Handle Multer errors first
  uploadProfilePictureController // Then handle the actual upload + DB update
);

export { router as userCreateRouter };
export { router };
