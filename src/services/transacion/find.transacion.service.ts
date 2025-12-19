import { Transaction } from "../../models/Transaction";

export async function findTransactionsByUserId(
  user_id: string,
  page: number,
  pageSize: number
) {
  const transactions = await Transaction.findAll({
    where: { reviewer_id: user_id },
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
  return transactions;
}

export async function findTransactionsByReviewerId(
  reviewer_id: string,
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;

  const transactions = await Transaction.findAll({
    where: { reviewer_id },
    offset: offset,
    limit: pageSize,
  });

  return transactions;
}

export async function findTransactionsByTransactionId(
  transaction_id: string,
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;
  const transactions = await Transaction.findAll({
    where: { transaction_id },
    offset: offset,
    limit: pageSize,
  });
  return transactions;
}

export async function findTransactionsByListingId(listing_id: string) {
  const transactions = await Transaction.findAll({
    where: { listing_id },
  });
  return transactions;
}

export async function findTransactionsByRentRequestId(rent_request_id: string) {
  const transactions = await Transaction.findOne({
    where: { rent_request_id },
  });
  return transactions;
}
