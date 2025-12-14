import { Router } from "express";
import { multerErrorHandler, uploadProfilePic } from "../middlewares/upload";
import { deleteUserProfileController } from "../controllers/profile/delete.profile.controller";
import { updateUserProfileController } from "../controllers/profile/update.profile.controller";
import { uploadProfilePictureController } from "../controllers/profile/uploadPicture.profile.controller";
import { createUserRentRequesController } from "../controllers/rentRequest/create.rentRequest.controller";
import {
  getRentRequestByBorrowerIdController,
  getRentRequestByLenderIdController,
  getRentRequestsController,
} from "../controllers/rentRequest/get.rentRequest.controller";

const router = Router();

router.post("/all", getRentRequestsController);
router.post("/getByBorrowerId", getRentRequestByBorrowerIdController);
router.post("/getByLenderId", getRentRequestByLenderIdController);
router.post("/", createUserRentRequesController);
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
