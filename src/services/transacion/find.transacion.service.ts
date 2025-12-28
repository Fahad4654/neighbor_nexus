import { Op } from "sequelize";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";
import { Tool } from "../../models/Tools";
import { getSearchWhereClause } from "../../utils/search";
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
  const searchClause = getSearchWhereClause(search, searchBy);
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
        as: "rentRequest",
        attributes: [
          "rent_status",
          "duration_unit",
          "duration_value",
          "pickup_time",
          "drop_off_time",
          "rental_price",
          "actual_pickup_time",
          "actual_drop_off_time",
          "cancellation_reason",
          "borrower_rated",
          "lender_rated",
        ],
      },
      {
        model: Tool,
        as: "listing",
        attributes: [
          "listing_id",
          "title",
          "is_available",
          "rental_count",
          "is_approved",
          "geo_location",
        ],
      },
      {
        model: User,
        as: "borrower",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
      {
        model: User,
        as: "lender",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
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
  const searchClause = getSearchWhereClause(search, searchBy);
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
        as: "rentRequest",
        attributes: [
          "rent_status",
          "duration_unit",
          "duration_value",
          "pickup_time",
          "drop_off_time",
          "rental_price",
          "actual_pickup_time",
          "actual_drop_off_time",
          "cancellation_reason",
          "borrower_rated",
          "lender_rated",
        ],
      },
      {
        model: Tool,
        as: "listing",
        attributes: [
          "listing_id",
          "title",
          "is_available",
          "rental_count",
          "is_approved",
          "geo_location",
        ],
      },
      {
        model: User,
        as: "borrower",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
      {
        model: User,
        as: "lender",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
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
        as: "rentRequest",
        attributes: [
          "rent_status",
          "duration_unit",
          "duration_value",
          "pickup_time",
          "drop_off_time",
          "rental_price",
          "actual_pickup_time",
          "actual_drop_off_time",
          "cancellation_reason",
          "borrower_rated",
          "lender_rated",
        ],
      },
      {
        model: Tool,
        as: "listing",
        attributes: [
          "listing_id",
          "title",
          "is_available",
          "rental_count",
          "is_approved",
          "geo_location",
        ],
      },
      {
        model: User,
        as: "borrower",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
      {
        model: User,
        as: "lender",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
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
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClause(search, searchBy);
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
        as: "rentRequest",
        attributes: [
          "rent_status",
          "duration_unit",
          "duration_value",
          "pickup_time",
          "drop_off_time",
          "rental_price",
          "actual_pickup_time",
          "actual_drop_off_time",
          "cancellation_reason",
          "borrower_rated",
          "lender_rated",
        ],
      },
      {
        model: Tool,
        as: "listing",
        attributes: [
          "listing_id",
          "title",
          "is_available",
          "rental_count",
          "is_approved",
          "geo_location",
        ],
      },
      {
        model: User,
        as: "borrower",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
      {
        model: User,
        as: "lender",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
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
  const searchClause = getSearchWhereClause(search, searchBy);

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
        as: "rentRequest",
        attributes: [
          "rent_status",
          "duration_unit",
          "duration_value",
          "pickup_time",
          "drop_off_time",
          "rental_price",
          "actual_pickup_time",
          "actual_drop_off_time",
          "cancellation_reason",
          "borrower_rated",
          "lender_rated",
        ],
      },
      {
        model: Tool,
        as: "listing",
        attributes: [
          "listing_id",
          "title",
          "is_available",
          "rental_count",
          "is_approved",
          "geo_location",
        ],
      },
      {
        model: User,
        as: "borrower",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
      {
        model: User,
        as: "lender",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
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
  const searchClause = getSearchWhereClause(search, searchBy);
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
        as: "rentRequest",
        attributes: [
          "rent_status",
          "duration_unit",
          "duration_value",
          "pickup_time",
          "drop_off_time",
          "rental_price",
          "actual_pickup_time",
          "actual_drop_off_time",
          "cancellation_reason",
          "borrower_rated",
          "lender_rated",
        ],
      },
      {
        model: Tool,
        as: "listing",
        attributes: [
          "listing_id",
          "title",
          "is_available",
          "rental_count",
          "is_approved",
          "geo_location",
        ],
      },
      {
        model: User,
        as: "borrower",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
      {
        model: User,
        as: "lender",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
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
