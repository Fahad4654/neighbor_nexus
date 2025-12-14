import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { User } from "../../models/User";

export async function findAllReentRequests(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await RentRequest.findAndCountAll({
    include: [
      {
        model: Tool,
        as: "listing",
        attributes: { exclude: ["owner_id", "createdAt", "updatedAt"] },
      },
      {
        model: User,
        as: "borrower",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
      {
        model: User,
        as: "lender",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
    ],
    nest: true,
    distinct: true,
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

export async function findByBorrowerId(
  borrowerId: string,
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await RentRequest.findAndCountAll({
    where: { borrower_id: borrowerId },
    include: [
      {
        model: Tool,
        as: "listing",
        attributes: { exclude: ["owner_id", "createdAt", "updatedAt"] },
      },
      {
        model: User,
        as: "borrower",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
      {
        model: User,
        as: "lender",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
  });
  return [
    {
      data: rows,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    },
  ];
}

export async function findByLenderId(
  lenderId: string,
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await RentRequest.findAndCountAll({
    where: { lender_id: lenderId },
    include: [
      {
        model: Tool,
        as: "listing",
        attributes: { exclude: ["owner_id", "createdAt", "updatedAt"] },
      },
      {
        model: User,
        as: "borrower",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
      {
        model: User,
        as: "lender",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
    ],
    nest: true,
    distinct: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
  });
  return [
    {
      data: rows,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    },
  ];
}

export async function findByListingId(listingId: string) {
  const rentRequests = await RentRequest.findOne({
    where: { listing_id: listingId },
    include: [
      {
        model: Tool,
        as: "listing",
        attributes: { exclude: ["owner_id", "createdAt", "updatedAt"] },
      },
      {
        model: User,
        as: "borrower",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
      {
        model: User,
        as: "lender",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
    ],
  });
  return rentRequests;
}

export async function findRentRequestByLenderAndListingId(
  lender_id: string,
  listing_id: string
) {
  const rentRequests = await RentRequest.findOne({
    where: { lender_id, listing_id },
    include: [
      {
        model: Tool,
        as: "listing",
        attributes: { exclude: ["owner_id", "createdAt", "updatedAt"] },
      },
      {
        model: User,
        as: "borrower",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
      {
        model: User,
        as: "lender",
        attributes: ["id", "username", "firstname", "lastname", "email"],
      },
    ],
  });
  return rentRequests;
}
