import { Op } from "sequelize";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

import { Tool } from "../../models/Tools";

const getSearchWhereClause = (search?: string) => {
  if (!search) return {};
  return {
    [Op.or]: [
      { "$listing.title$": { [Op.iLike]: `%${search}%` } },
      { "$borrower.firstname$": { [Op.iLike]: `%${search}%` } },
      { "$borrower.lastname$": { [Op.iLike]: `%${search}%` } },
      { "$borrower.email$": { [Op.iLike]: `%${search}%` } },
      { "$lender.firstname$": { [Op.iLike]: `%${search}%` } },
      { "$lender.lastname$": { [Op.iLike]: `%${search}%` } },
      { "$lender.email$": { [Op.iLike]: `%${search}%` } },
    ],
  };
};

export async function findTransactionsByBorrowerId(
  borrower_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10,
  search?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClause(search);
  const whereClause = {
    borrower_id,
    show_to_borrower: true,
    ...searchClause,
  };

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      { model: Tool, as: "listing" },
      { model: User, as: "borrower" },
      { model: User, as: "lender" },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
    subQuery: false,
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
  pageSize = 10,
  search?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClause(search);
  const whereClause = {
    lender_id,
    show_to_lender: true,
    ...searchClause,
  };

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      { model: Tool, as: "listing" },
      { model: User, as: "borrower" },
      { model: User, as: "lender" },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
    subQuery: false,
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
  const transaction = await Transaction.findByPk(transaction_id, {
    include: [
      { model: Tool, as: "listing" },
      { model: User, as: "borrower" },
      { model: User, as: "lender" },
    ],
  });
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
  pageSize = 10,
  search?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClause(search);
  const whereClause = {
    listing_id,
    show_to_lender: true,
    ...searchClause,
  };

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      { model: Tool, as: "listing" },
      { model: User, as: "borrower" },
      { model: User, as: "lender" },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
    subQuery: false,
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
  user: User,
  search?: string
) {
  let whereClause: any = {};
  const searchClause = getSearchWhereClause(search);

  if (user.isAdmin) {
    // Admins see everything regardless of user visibility flags
    whereClause = { rent_request_id, ...searchClause };
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
      ...searchClause,
    };
  }
  const transactions = await Transaction.findAll({
    where: whereClause,
    include: [
      { model: Tool, as: "listing" },
      { model: User, as: "borrower" },
      { model: User, as: "lender" },
    ],
  });
  return transactions;
}

export async function findTransactionsByUserId(
  user_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10,
  search?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClause(search);
  const whereClause = {
    [Op.and]: [
      {
        [Op.or]: [
          {
            [Op.and]: [{ lender_id: user_id }, { show_to_lender: true }],
          },
          {
            [Op.and]: [{ borrower_id: user_id }, { show_to_borrower: true }],
          },
        ],
      },
      searchClause,
    ],
  };

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      { model: Tool, as: "listing" },
      { model: User, as: "borrower" },
      { model: User, as: "lender" },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
    subQuery: false,
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
