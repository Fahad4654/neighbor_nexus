import { Review } from "../../models/Review";
import { Transaction } from "../../models/Transaction";

export async function createTransaction(
  listing_id: string,
  borrower_id: string,
  rent_request_id: string,
  start_time: Date,
  // end_time
  total_fee: number,
  platform_commission: number,
  deposit_amount: number,
  stripe_charge_id: string,
  status: string
) {
  const transaction = await Transaction.create({
    listing_id,
    borrower_id,
    rent_request_id,
    start_time,
    // end_time,
    total_fee,
    platform_commission,
    deposit_amount,
    stripe_charge_id,
    status,
  });
  return transaction;
}
