import { RentRequest } from "../../models/RentRequest";
import { User } from "../../models/User";

export async function deleteRentRequest(rentRequestID: string, user: User) {
  const wantToDelRentRequest = await RentRequest.findByPk(rentRequestID);

  if (!wantToDelRentRequest) {
    throw new Error("Rent Request not found");
  }

  // 1. Security Check: Is this user even part of this request?
  const isBorrower = wantToDelRentRequest.borrower_id === user.id;
  const isLender = wantToDelRentRequest.lender_id === user.id;

  if (!isBorrower && !isLender) {
    throw new Error("Unauthorized: You are not part of this rental request");
  }

  // 2. Check if already hidden for this specific user
  if ((isBorrower && !wantToDelRentRequest.show_to_borrower) ||
    (isLender && !wantToDelRentRequest.show_to_lender)) {
    throw new Error("This rent request is already deleted");
  }

  // 3. Status Check: Block deletion only for sensitive states
  // Example: Prevent deletion if the tool is currently with the borrower
  const forbiddenStates = ["Requested"];
  if (forbiddenStates.includes(wantToDelRentRequest.rent_status)) {
    throw new Error(`Cannot remove request while it is ${wantToDelRentRequest.rent_status}`);
  }

  // 4. Perform "Soft Delete" for the specific user
  if (isBorrower) {
    wantToDelRentRequest.show_to_borrower = false;
  }
  if (isLender) {
    wantToDelRentRequest.show_to_lender = false;
  }

  await wantToDelRentRequest.save();
  return wantToDelRentRequest;
}