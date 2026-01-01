import { Review } from "../../models/Review";
import { User } from "../../models/User";
import { getSearchWhereClause as getSearchWhereClauseV2 } from "../../utils/search.v2";

export async function findReviewsByrevieweeId(
  reviewee_id: string,
  page: number,
  pageSize: number,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { reviewee_id, show_to_reviewee: true, ...whereClause },
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

export async function findReviewsByreviewerId(
  reviewer_id: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { reviewer_id, show_to_reviewer: true, ...whereClause },
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

export async function findReviewsByTransactionId(
  transaction_id: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { transaction_id, ...whereClause },
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

export async function findAllReviews(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { ...whereClause },
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

export async function findReviewByReviewId(review_id: string, user: User) {
  const review = await Review.findByPk(review_id);

  if (!review) {
    return null;
  }

  if (
    (user.id !== review.reviewee_id && review.show_to_reviewee === false) ||
    (user.id !== review.reviewer_id && review.show_to_reviewer === false) ||
    !user.isAdmin
  ) {
    return null;
  }

  return review;
}
