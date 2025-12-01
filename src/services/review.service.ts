import { Review } from "../models/Review";

export async function createReview(
  userID: string,
  transactionID: string,
  reviewerID: string,
  rating: number,
  comment: string
) {
  const review = await Review.create({
    user_id: userID,
    transaction_id: transactionID,
    reviewer_id: reviewerID,
    rating: rating,
    comment: comment,
    approved: false,
  });
  return review;
}

export async function findReviewsByUserId(
  user_id: string,
  page: number,
  pageSize: number
) {
  const reviews = await Review.findAll({
    where: { user_id },
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
  return reviews;
}

export async function findReviewsByReviewerId(
  reviewer_id: string,
  page: number,
  pageSize: number
) {
  const reviews = await Review.findAll({
    where: { reviewer_id },
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
  return reviews;
}

export async function findReviewsByTransactionId(transaction_id: string) {
  const reviews = await Review.findAll({
    where: { transaction_id },
  });
  return reviews;
}

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

export async function deleteReview(reviewID: string, actionerID: string) {
  const review = await Review.findByPk(reviewID);
  if (!review) {
    throw new Error("Review not found");
  }

  if (review.approvedBy !== actionerID && review.reviewer_id !== actionerID) {
    throw new Error("Unauthorized to delete this review");
  }

  return await Review.destroy({ where: { review_id: reviewID } });
}
