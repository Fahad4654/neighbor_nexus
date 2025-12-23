import { Op } from "sequelize";
import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { User } from "../../models/User";

const getSearchWhereClause = (search?: string, searchBy?: string) => {
  if (!search) return {};

  if (searchBy) {
    const map: Record<string, string> = {
      listing_title: "$listing.title$",
      borrower_firstname: "$borrower.firstname$",
      borrower_lastname: "$borrower.lastname$",
      borrower_email: "$borrower.email$",
      lender_firstname: "$lender.firstname$",
      lender_lastname: "$lender.lastname$",
      lender_email: "$lender.email$",
    };

    const column = map[searchBy];
    if (column) {
      return {
        [column]: { [Op.iLike]: `%${search}%` },
      };
    }
  }

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

export async function findAllRentRequests(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10,
  search?: string,
  searchBy?: string
) {
  const offset = (page - 1) * pageSize;
  const whereClause = getSearchWhereClause(search, searchBy);


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
  const searchClause = getSearchWhereClause(search, searchBy);
  const whereClause = { borrower_id: borrowerId, ...searchClause };

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
  const searchClause = getSearchWhereClause(search, searchBy);
  const whereClause = { lender_id: lenderId, ...searchClause };

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
  const searchClause = getSearchWhereClause(search, searchBy);
  const whereClause = { listing_id: listingId, ...searchClause };

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
  const searchClause = getSearchWhereClause(search, searchBy);
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
