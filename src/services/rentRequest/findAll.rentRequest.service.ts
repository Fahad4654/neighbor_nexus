import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { User } from "../../models/User";
import { getSearchWhereClause as getSearchWhereClauseV2 } from "../../utils/search.v2";

export async function findAllRentRequests(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const whereClause = getSearchWhereClauseV2(search, RentRequest, searchBy);

  const { count, rows } = await RentRequest.findAndCountAll({
    where: whereClause,
    include: [
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

export async function findByBorrowerId(
  borrowerId: string,
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, RentRequest, searchBy);
  const whereClause = {
    borrower_id: borrowerId,
    show_to_borrower: true,
    ...searchClause,
  };

  const { count, rows } = await RentRequest.findAndCountAll({
    where: whereClause,
    include: [
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

export async function findByLenderId(
  lenderId: string,
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, RentRequest, searchBy);
  const whereClause = {
    lender_id: lenderId,
    show_to_lender: true,
    ...searchClause,
  };

  const { count, rows } = await RentRequest.findAndCountAll({
    where: whereClause,
    include: [
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

export async function findByListingId(
  listingId: string,
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, RentRequest, searchBy);
  const whereClause = {
    listing_id: listingId,
    show_to_lender: true,
    ...searchClause,
  };

  const { count, rows } = await RentRequest.findAndCountAll({
    where: whereClause,
    include: [
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

export async function findRentRequestByBorrowerIDAndListingId(
  listing_id: string,
  borrower_id: string,
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const searchClause = getSearchWhereClauseV2(search, RentRequest, searchBy);
  const whereClause = { listing_id, borrower_id, ...searchClause };

  const { count, rows } = await RentRequest.findAndCountAll({
    where: whereClause,
    include: [
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

export async function findByRentRequestId(rentRequestID: string) {
  const rentRequest = await RentRequest.findOne({
    where: { id: rentRequestID },
    include: [
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
  return rentRequest;
}
