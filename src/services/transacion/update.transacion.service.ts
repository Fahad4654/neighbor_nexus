import { Transaction } from "../../models/Transaction";

export async function updateTransaction(
  data: Partial<Transaction> & { id: string }
) {
  const transaction = await Transaction.findOne({
    where: { review_id: data.id },
  });
  if (!transaction) {
    console.log("Transaction not found");
    throw new Error("Transaction not found");
  }

  const allowedFields: Array<keyof Transaction> = [
    "status",
    "stripe_charge_id",
  ];
  const updates: Partial<Transaction> = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (Object.keys(updates).length === 0) {
    console.log("No valid fields provided for update");
    throw new Error("No valid fields provided for update");
  }

  await transaction.update(updates);
  return Transaction.findByPk(transaction.id);
}
