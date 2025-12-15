import { Router } from "express";
import { multerErrorHandler, uploadProfilePic } from "../middlewares/upload";
import { deleteUserProfileController } from "../controllers/profile/delete.profile.controller";
import { uploadProfilePictureController } from "../controllers/profile/uploadPicture.profile.controller";
import {
  getByRentRequestIdController,
  getRentRequestByBorrowerAndListingIdController,
  getRentRequestByBorrowerIdController,
  getRentRequestByLenderIdController,
  getRentRequestByListingIdController,
  getRentRequestsController,
} from "../controllers/rentRequest/get.rentRequest.controller";
import { updateRentRequestController } from "../controllers/rentRequest/update.rentRequest.controller";
import { createRentRequesController } from "../controllers/rentRequest/create.rentRequest.controller";

const router = Router();

router.post("/all", getRentRequestsController);
router.post("/getByBorrowerId", getRentRequestByBorrowerIdController);
router.post("/getByLenderId", getRentRequestByLenderIdController);
router.post("/getByListingId", getRentRequestByListingIdController);
router.post(
  "/getByBorrowerAndListingId",
  getRentRequestByBorrowerAndListingIdController
);
router.get("/:id", getByRentRequestIdController);
router.post("/", createRentRequesController);
router.put("/", updateRentRequestController);
router.delete("/", deleteUserProfileController);

export { router as userCreateRouter };
export { router };
