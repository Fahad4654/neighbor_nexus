import { Review } from "../../models/Review";

export async function deleteReview(
  review_id: string,
  actionerID: string,
  isAdmin: boolean = false
) {
  const review = await Review.findByPk(review_id);
  if (!review) throw new Error("Review not found");

  // If it's not approved, only the Reviewer or Admin can touch it
  if (!review.approved) {
    if (review.reviewer_id === actionerID || isAdmin) {
      // Hard delete since it was never "public"
      await review.destroy();
      return { message: "Unapproved review discarded" };
    } else {
      throw new Error("Unauthorized: Review is pending approval");
    }
  }

  // If it IS approved, proceed with the "Soft Delete" (hiding) logic
  if (review.reviewer_id === actionerID) {
    review.show_to_reviewer = false;
  } else if (review.reviewee_id === actionerID) {
    review.show_to_reviewee = false;
  } else if (isAdmin) {
    await review.destroy(); // Admins can hard delete approved reviews too
    return { message: "Review deleted by admin" };
  } else {
    throw new Error("Unauthorized to modify this review");
  }

  await review.save();
  return review;
}
