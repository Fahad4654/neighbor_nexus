import { RentRequest } from "../../models/RentRequest";

export async function deleteRentRequest(rentRequestID: string, userID: string) {
  const wantToDelRentRequest = await RentRequest.findByPk(rentRequestID);
  if (!wantToDelRentRequest) {
    throw new Error("Rent Request not found");
  }

  if (
    wantToDelRentRequest.borrower_id !== userID &&
    wantToDelRentRequest.lender_id !== userID
  ) {
    throw new Error("Unauthorized to delete this rent request");
  }

  return await RentRequest.destroy({
    where: { rent_request_id: rentRequestID },
  });
}
