import { Review } from "../../models/Review";

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
