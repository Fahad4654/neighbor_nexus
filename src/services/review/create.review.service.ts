import { Review } from "../../models/Review";

export async function createReview(
  reviewed_user_id: string,
  transactionID: string,
  userId: string,
  rating: number,
  comment: string
) {
  const review = await Review.create({
    reviewed_user_id: reviewed_user_id,
    transaction_id: transactionID,
    reviewer_id: userId,
    rating: rating,
    comment: comment,
    approved: false,
    approvedBy: userId,
  });
  return review;
}
