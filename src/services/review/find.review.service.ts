import { Op } from "sequelize";
import { Review } from "../../models/Review";
import { User } from "../../models/User";
import { getSearchWhereClause as getSearchWhereClauseV2 } from "../../utils/search.v2";
import { findByDynamicId } from "../global/find.service";

export async function findReviewsByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  searchBy?: string,
  order = "id",
  asc: "ASC" | "DESC" = "ASC"
) {
  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);
  const offset = (page - 1) * pageSize;
  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User;

  const { count, rows } = await Review.findAndCountAll({
    where: {
      [Op.and]: [
        {
          [Op.or]: [
            // Perspective 1: User is the Reviewee (Only show if approved and visible)
            {
              reviewee_id: userId,
              approved: true,
              show_to_reviewee: true,
            },
            // Perspective 2: User is the Reviewer (Show even if pending, unless hidden)
            {
              reviewer_id: userId,
              show_to_reviewer: true,
            },
          ],
        },
        whereClause, // Applies search filters on top of the visibility logic
      ],
    },
    offset,
    limit: pageSize,
    order: [[order, asc]],
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

export async function findReviewsByrevieweeId(
  reviewee_id: string,
  page: number,
  pageSize: number,
  search?: string,
  searchBy?: string,
  order = "id",
  asc: "ASC" | "DESC" = "ASC"
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: {
      reviewee_id,
      show_to_reviewee: true,
      approved: true, // IMPORTANT: Public can only see approved reviews
      ...whereClause,
    },
    offset,
    limit: pageSize,
    order: [[order, asc]],
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
  searchBy?: string,
  order = "id",
  asc: "ASC" | "DESC" = "ASC"
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { reviewer_id, show_to_reviewer: true, ...whereClause },
    offset,
    limit: pageSize,
    order: [[order, asc]],
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
  requestingUserId: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  searchBy?: string,
  order = "id",
  asc: "ASC" | "DESC" = "ASC"
) {
  const offset = (page - 1) * pageSize;
  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: {
      [Op.and]: [
        { transaction_id }, // Must belong to this transaction
        {
          [Op.or]: [
            // Rule 1: Anyone can see it if it's approved and not hidden by the target
            {
              reviewee_id: requestingUserId,
              approved: true,
              show_to_reviewee: true,
            },
            // Rule 2: The author can see it even if it's NOT approved
            { reviewer_id: requestingUserId, show_to_reviewer: true },
          ],
        },
        whereClause || {},
      ],
    },
    offset,
    limit: pageSize,
    order: [[order, asc]],
  });

  console.log(rows);

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
  searchBy?: string,
  order = "id",
  asc: "ASC" | "DESC" = "ASC"
) {
  const offset = (page - 1) * pageSize;

  const whereClause = getSearchWhereClauseV2(search, Review, searchBy);

  const { count, rows } = await Review.findAndCountAll({
    where: { ...whereClause },
    offset,
    limit: pageSize,
    order: [[order, asc]],
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
  if (!review) return null;

  // 1. Admins see everything
  if (user.isAdmin) return review;

  // 2. If it's not approved, ONLY the reviewer can see it
  if (!review.approved) {
    return review.reviewer_id === user.id ? review : null;
  }

  // 3. If it's approved, check visibility flags based on who is asking
  if (user.id === review.reviewer_id && !review.show_to_reviewer) return null;
  if (user.id === review.reviewee_id && !review.show_to_reviewee) return null;

  return review;
}
