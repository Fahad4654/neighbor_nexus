import { Review } from "../../models/Review";
import { Transaction } from "../../models/Transaction";

export async function deleteTransaction(
  transaction_id: string,
  actionerID: string
) {
  const transaction = await Transaction.findByPk(transaction_id);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (
    transaction.borrower_id !== actionerID &&
    transaction.lender_id !== actionerID
  ) {
    throw new Error("Unauthorized to delete this transaction");
  }

  if (transaction.lender_id === actionerID) {
    transaction.show_to_lender = false;
  }

  if (transaction.borrower_id === actionerID) {
    transaction.show_to_borrower = false;
  }

  transaction.save();
  return transaction;
}
