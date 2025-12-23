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

import { Op } from "sequelize";

export async function findReviewsByReviewerId(
  reviewer_id: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  const offset = (page - 1) * pageSize;

  let whereClause: any = { reviewer_id };
  if (search) {
    whereClause = {
      ...whereClause,
      comment: { [Op.iLike]: `%${search}%` },
    };
  }

  const { count, rows } = await Review.findAndCountAll({
    where: whereClause,
    offset,
    limit: pageSize,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

export async function findReviewsByTransactionId(transaction_id: string) {
  const reviews = await Review.findAll({
    where: { transaction_id },
  });
  return reviews;
}
