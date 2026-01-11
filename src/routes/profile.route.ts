import { Router } from "express";
import { multerErrorHandler, uploadProfilePic } from "../middlewares/upload";
import { getUsersProfileController } from "../controllers/profile/get.profile.controller";
import { createUserProfileController } from "../controllers/profile/create.profile.controller";
import { deleteUserProfileController } from "../controllers/profile/delete.profile.controller";
import { updateUserProfileController } from "../controllers/profile/update.profile.controller";
import { uploadProfilePictureController } from "../controllers/profile/uploadPicture.profile.controller";

const router = Router();

router.post("/all", getUsersProfileController);
router.post("/", createUserProfileController);
router.put("/", updateUserProfileController);
router.delete("/", deleteUserProfileController);

router.post(
  "/upload-avatar",
  uploadProfilePic,
  multerErrorHandler,
  uploadProfilePictureController
);

export { router as userCreateRouter };
export { router };
