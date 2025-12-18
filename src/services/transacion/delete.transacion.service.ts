import { Review } from "../../models/Review";

export async function deleteReview(reviewID: string, actionerID: string) {
  const review = await Review.findByPk(reviewID);
  if (!review) {
    throw new Error("Review not found");
  }

  if (review.approvedBy !== actionerID && review.borrower_id !== actionerID) {
    throw new Error("Unauthorized to delete this review");
  }

  return await Review.destroy({ where: { review_id: reviewID } });
}
