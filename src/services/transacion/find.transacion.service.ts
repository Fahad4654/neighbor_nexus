import { Op } from "sequelize";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";
import { Tool } from "../../models/Tools";
import { getSearchWhereClause as getSearchWhereClauseV2 } from "../../utils/search.v2";
import { RentRequest } from "../../models/RentRequest";

export async function findTransactionsByBorrowerId(
  borrower_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, Transaction, searchBy);
  const whereClause = {
    borrower_id,
    show_to_borrower: true,
    ...searchClause,
  };

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: RentRequest,
        as: "rent_request",
        attributes: ["rent_status", "rental_price", "cancellation_reason"],
      }, // truncated for brevity
      {
        model: Tool,
        as: "listing",
        attributes: ["listing_id", "title", "geo_location"],
      },
      { model: User, as: "borrower", attributes: ["id", "username", "email"] },
      { model: User, as: "lender", attributes: ["id", "username", "email"] },
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
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, Transaction, searchBy);
  const whereClause = {
    lender_id,
    show_to_lender: true,
    ...searchClause,
  };

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: RentRequest,
        as: "rent_request",
        attributes: ["rent_status", "rental_price", "cancellation_reason"],
      }, // truncated for brevity
      {
        model: Tool,
        as: "listing",
        attributes: ["listing_id", "title", "geo_location"],
      },
      { model: User, as: "borrower", attributes: ["id", "username", "email"] },
      { model: User, as: "lender", attributes: ["id", "username", "email"] },
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
      {
        model: RentRequest,
        as: "rent_request",
        attributes: ["rent_status", "rental_price", "cancellation_reason"],
      }, // truncated for brevity
      {
        model: Tool,
        as: "listing",
        attributes: ["listing_id", "title", "geo_location"],
      },
      { model: User, as: "borrower", attributes: ["id", "username", "email"] },
      { model: User, as: "lender", attributes: ["id", "username", "email"] },
    ],
  });

  // If it doesn't exist, return null early
  if (!transaction) return null;

  // Check Permissions
  const isLender =
    transaction.lender_id === user.id && transaction.show_to_lender;
  const isBorrower =
    transaction.borrower_id === user.id && transaction.show_to_borrower;
  const isAdmin = !!user.isAdmin;

  if (!isLender && !isBorrower && !isAdmin) {
    // Option 1: Throw a specific error your middleware can catch (e.g., 403 Forbidden)
    // Option 2: Return null so the user doesn't even know it exists (404 style)
    throw new Error("UNAUTHORIZED_ACCESS");
  }

  return transaction;
}

export async function findTransactionsByListingId(
  listing_id: string,
  order = "cratedAt",
  asc = "DESC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, Transaction, searchBy);
  const whereClause = {
    listing_id,
    show_to_lender: true,
    ...searchClause,
  };

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: RentRequest,
        as: "rent_request",
        attributes: ["rent_status", "rental_price", "cancellation_reason"],
      }, // truncated for brevity
      {
        model: Tool,
        as: "listing",
        attributes: ["listing_id", "title", "geo_location"],
      },
      { model: User, as: "borrower", attributes: ["id", "username", "email"] },
      { model: User, as: "lender", attributes: ["id", "username", "email"] },
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
  search?: string,
  searchBy?: string
) {
  let whereClause: any = {};
  const searchClause = getSearchWhereClauseV2(search, Transaction, searchBy);

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
      {
        model: RentRequest,
        as: "rent_request",
        attributes: ["rent_status", "rental_price", "cancellation_reason"],
      }, // truncated for brevity
      {
        model: Tool,
        as: "listing",
        attributes: ["listing_id", "title", "geo_location"],
      },
      { model: User, as: "borrower", attributes: ["id", "username", "email"] },
      { model: User, as: "lender", attributes: ["id", "username", "email"] },
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
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, Transaction, searchBy);
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
      {
        model: RentRequest,
        as: "rent_request",
        attributes: ["rent_status", "rental_price", "cancellation_reason"],
      }, // truncated for brevity
      {
        model: Tool,
        as: "listing",
        attributes: ["listing_id", "title", "geo_location"],
      },
      { model: User, as: "borrower", attributes: ["id", "username", "email"] },
      { model: User, as: "lender", attributes: ["id", "username", "email"] },
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
