import { Op } from "sequelize";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

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
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;
  const transactions = await Transaction.findAll({
    where: { listing_id, show_to_lender: true },
    offset: offset,
    limit: pageSize,
  });
  return transactions;
}

export async function findTransactionsByRentRequestId(
  rent_request_id: string,
  user: User
) {
  let whereClause: any = {};
  if (user.isAdmin) {
    whereClause = { rent_request_id };
  } else {
    whereClause = {
      [Op.or]: [{ lender_id: user.id }, { borrower_id: user.id }],
    };
  }
  const transactions = await Transaction.findAll({
    where: whereClause,
  });
  return transactions;
}

export async function findTransactionsByUserId(
  user_id: string,
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;
  const transactions = await Transaction.findAll({
    where: { [Op.or]: [{ lender_id: user_id }, { borrower_id: user_id }] },
    offset: offset,
    limit: pageSize,
  });
  return transactions;
}
