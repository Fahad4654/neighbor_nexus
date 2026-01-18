import { Review } from "../../models/Review";
import { Transaction } from "../../models/Transaction";

export async function createReview(
  transactionID: string,
  userId: string,
  rating: number,
  comment?: string
) {
  const transaction = await Transaction.findOne({
    where: {
      id: transactionID,
    },
  });
  if (!transaction) {
    throw new Error("Transaction not found");
  }
  let reviewed_user_id: string;
  if (transaction.borrower_id === userId) {
    reviewed_user_id = transaction.lender_id;
  } else {
    reviewed_user_id = transaction.borrower_id;
  }
  const review = await Review.create({
    reviewed_user_id: reviewed_user_id,
    transaction_id: transactionID,
    reviewer_id: userId,
    rating: rating,
    comment: comment ? comment : "",
    approved: false,
    approvedBy: "",
  });
  return review;
}
