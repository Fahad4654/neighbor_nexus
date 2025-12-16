import { Router } from "express";
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
import { deleteRentRequestController } from "../controllers/rentRequest/delete.rentRequest.controller";

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
router.delete("/", deleteRentRequestController);

export { router as userCreateRouter };
export { router };
