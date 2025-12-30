import { Review } from "../../models/Review";
import { getSearchWhereClause as getSearchWhereClauseV2 } from "../../utils/search.v2";

export async function findReviewsByLenderId(
  user_id: string,
  page: number,
  pageSize: number,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { lender_id: user_id, ...whereClause },
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

export async function findReviewsByBorrowerId(
  borrower_id: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { borrower_id, ...whereClause },
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