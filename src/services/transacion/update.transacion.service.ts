import { Review } from "../../models/Review";

export async function updateReview(data: Partial<Review> & { id: string }) {
  const review = await Review.findOne({ where: { review_id: data.id } });
  if (!review) {
    console.log("Review not found");
    throw new Error("Review not found");
  }

  const allowedFields: Array<keyof Review> = [
    "rating",
    "comment",
    "approved",
    "approvedBy",
  ];
  const updates: Partial<Review> = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (Object.keys(updates).length === 0) {
    console.log("No valid fields provided for update");
    throw new Error("No valid fields provided for update");
  }

  await review.update(updates);
  return Review.findByPk(review.id, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
}
