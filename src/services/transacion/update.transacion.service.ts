import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

/**
 * Updates a transaction. 
 * @param isSystem - Defaults to false. If true, all fields are updatable. 
 * If false, only 'status' and 'stripe_charge_id' are updatable.
 */
export async function updateTransaction(
  data: Partial<Transaction> & { transaction_id: string }, 
  user: User,
  isSystem: boolean = false
) {
  // 1. Fetch transaction (using transaction_id as the primary lookup)
  const transaction = await Transaction.findOne({
    where: { transaction_id: data.transaction_id },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // 2. Authorization Logic
  // System calls bypass this; User calls must be Borrower, Lender, or Admin
  if (!isSystem) {
    const isAuthorized = 
      user.id === transaction.borrower_id || 
      user.id === transaction.lender_id || 
      user.isAdmin;

    if (!isAuthorized) {
      throw new Error("User is not authorized to update this transaction");
    }
  }

  // 3. Define Permitted Fields
  const USER_FIELDS: Array<keyof Transaction> = ["status", "stripe_charge_id"];
  const SYSTEM_FIELDS: Array<keyof Transaction> = [
    "status",
    "stripe_charge_id",
    "start_time",
    "end_time",
    "total_fee",
    "platform_commission",
    "deposit_amount",
  ];

  const allowedFields = isSystem ? SYSTEM_FIELDS : USER_FIELDS;
  const updates: Partial<Transaction> = {};

  // 4. Sanitization: Only pick values present in the allowed list
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      updates[key] = data[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  // 5. Apply Updates
  await transaction.update(updates);

  // Return the fresh record
  return Transaction.findOne({ where: { transaction_id: data.transaction_id } });
}