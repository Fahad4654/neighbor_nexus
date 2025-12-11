import { Review } from "../../models/Review";

export async function findReviewsByUserId(
  user_id: string,
  page: number,
  pageSize: number
) {
  const reviews = await Review.findAll({
    where: { reviewer_id: user_id },
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
  return reviews;
}

export async function findReviewsByReviewerId(
  reviewer_id: string,
  page: number = 1, // Default set in function signature
  pageSize: number = 10 // Default set in function signature
) {
  // Using the defaults from the function signature simplifies the function body
  const offset = (page - 1) * pageSize;

  // Use 'findAndCountAll' if you need the total number of records for pagination UI
  const reviews = await Review.findAll({
    where: { reviewer_id },
    offset: offset, // Correct calculation
    limit: pageSize, // Correct limit
  });

  return reviews;
}

export async function findReviewsByTransactionId(transaction_id: string) {
  const reviews = await Review.findAll({
    where: { transaction_id },
  });
  return reviews;
}
