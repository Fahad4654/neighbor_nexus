import { Review } from "../../models/Review";
import { Transaction } from "../../models/Transaction";

export async function createReview(
  transactionID: string,
  userId: string,
  rating: number,
  comment?: string
) {
  console.log(transactionID);
  const transaction = await Transaction.findOne({
    where: {
      transaction_id: transactionID,
    },
  });
  console.log(transaction);
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
    reviewee_id: reviewed_user_id,
    transaction_id: transaction.transaction_id,
    reviewer_id: userId,
    rating: rating,
    comment: comment ? comment : "",
    approved: false,
    approvedBy: null,
  });
  return review;
}
