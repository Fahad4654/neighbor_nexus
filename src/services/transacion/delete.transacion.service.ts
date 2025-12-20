import { Review } from "../../models/Review";
import { Transaction } from "../../models/Transaction";

export async function deleteTransaction(
  transaction_id: string,
  actionerID: string
) {
  const review = await Transaction.findByPk(transaction_id);
  if (!review) {
    throw new Error("Transaction not found");
  }

  // if (review.approvedBy !== actionerID && review.borrower_id !== actionerID) {
  //   throw new Error("Unauthorized to delete this review");
  // }

  return await Transaction.destroy({ where: { id: transaction_id } });
}
