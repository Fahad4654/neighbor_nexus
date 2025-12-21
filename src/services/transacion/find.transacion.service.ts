import { Transaction } from "../../models/Transaction";

export async function findTransactionsByBorrowerId(
  borrower_id: string,
  page: number,
  pageSize: number
) {
  const transactions = await Transaction.findAll({
    where: { borrower_id, show_to_borrower: true },
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
  return transactions;
}

export async function findTransactionsByLenderId(
  lender_id: string,
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;

  const transactions = await Transaction.findAll({
    where: { lender_id, show_to_lender: true },
    offset: offset,
    limit: pageSize,
  });

  return transactions;
}

export async function findTransactionsByTransactionId(transaction_id: string) {
  const transactions = await Transaction.findByPk(transaction_id);
  return transactions;
}

export async function findTransactionsByListingId(listing_id: string) {
  const transactions = await Transaction.findAll({
    where: { listing_id, show_to_lender: true },
  });
  return transactions;
}

export async function findTransactionsByRentRequestId(
  rent_request_id: string,
  lender: boolean
) {
  let whereClause: any = {};
  if (lender) {
    whereClause = { rent_request_id, show_to_lender: true };
  } else {
    whereClause = { rent_request_id, show_to_borrower: true };
  }
  const transactions = await Transaction.findAll({
    where: whereClause,
  });
  return transactions;
}
