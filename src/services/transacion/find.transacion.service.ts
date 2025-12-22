import { Op } from "sequelize";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

export async function findTransactionsByBorrowerId(
  borrower_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Transaction.findAndCountAll({
    where: { borrower_id, show_to_borrower: true },
    nest: true,
    raw: true,
    limit: pageSize,
    offset,
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

export async function findTransactionsByLenderId(
  lender_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Transaction.findAndCountAll({
    where: { lender_id, show_to_lender: true },
    nest: true,
    raw: true,
    limit: pageSize,
    offset,
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

export async function findTransactionByTransactionId(
  transaction_id: string,
  user: User
) {
  const transaction = await Transaction.findByPk(transaction_id);
  if (!transaction) {
    return null;
  }
  if (
    transaction.lender_id !== user.id &&
    transaction.borrower_id !== user.id &&
    !user.isAdmin
  ) {
    throw new Error("Unauthorized to view this transaction");
  }
  return transaction;
}

export async function findTransactionsByListingId(
  listing_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Transaction.findAndCountAll({
    where: { listing_id, show_to_lender: true },
    nest: true,
    raw: true,
    limit: pageSize,
    offset,
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

export async function findTransactionsByRentRequestId(
  rent_request_id: string,
  user: User
) {
  let whereClause: any = {};
  if (user.isAdmin) {
    // Admins see everything regardless of user visibility flags
    whereClause = { rent_request_id };
  } else {
    // Non-admins only see it if they are a participant AND haven't hidden it
    whereClause = {
      rent_request_id,
      [Op.or]: [
        {
          [Op.and]: [{ lender_id: user.id }, { show_to_lender: true }],
        },
        {
          [Op.and]: [{ borrower_id: user.id }, { show_to_borrower: true }],
        },
      ],
    };
  }
  const transactions = await Transaction.findAll({
    where: whereClause,
  });
  return transactions;
}

export async function findTransactionsByUserId(
  user_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Transaction.findAndCountAll({
    where: {
      [Op.or]: [
        {
          [Op.and]: [{ lender_id: user_id }, { show_to_lender: true }],
        },
        {
          [Op.and]: [{ borrower_id: user_id }, { show_to_borrower: true }],
        },
      ],
    },
    nest: true,
    raw: true,
    limit: pageSize,
    offset,
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
