import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

export async function deleteTransaction(
  transaction_id: string,
  actioner: User
) {
  const transaction = await Transaction.findByPk(transaction_id);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status === "Pending") {
    throw new Error("Transaction is in 'Pending' status");
  }

  const isLender =
    transaction.lender_id === actioner.id && transaction.show_to_lender;
  const isBorrower =
    transaction.borrower_id === actioner.id && transaction.show_to_borrower;

  if (!isLender && !isBorrower) {
    throw new Error(
      "Unauthorized to delete this transaction Or transaction is deleted by you"
    );
  }

  if (isLender) {
    transaction.show_to_lender = false;
  }

  if (isBorrower) {
    transaction.show_to_borrower = false;
  }

  await transaction.save();
  return transaction;
}
