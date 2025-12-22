import { Router } from "express";
import {
  getTransactionByRentRequest,
  getTransactionBytransactionIdController,
  getTransactionsByBorrowerIdController,
  getTransactionsBylenderIdController,
  getTransactionsByListingIdController,
  getTransactionsByUserIdController,
} from "../controllers/transaction/get.transaction.controller";
import { createTransactionController } from "../controllers/transaction/create.transaction.controller";
import { updateTransactionController } from "../controllers/transaction/update.transaction.controller";
import { deleteTransactionController } from "../controllers/transaction/delete.transaction.controller";

const router = Router();

router.get("/:id", getTransactionBytransactionIdController);
router.post("/user/:id", getTransactionsByUserIdController);
router.post("/borrower/:id", getTransactionsByBorrowerIdController);
router.post("/lender/:id", getTransactionsBylenderIdController);
router.post("/tool/:id", getTransactionsByListingIdController);
router.post("/rent-request/:id", getTransactionByRentRequest);

router.post("/", createTransactionController);
router.put("/", updateTransactionController);
router.delete("/", deleteTransactionController);

export { router as userCreateRouter };
export { router };
