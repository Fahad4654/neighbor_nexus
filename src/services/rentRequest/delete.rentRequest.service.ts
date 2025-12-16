import { RentRequest } from "../../models/RentRequest";
import { User } from "../../models/User";

export async function deleteRentRequest(rentRequestID: string, user: User) {
  const wantToDelRentRequest = await RentRequest.findByPk(rentRequestID);
  if (!wantToDelRentRequest) {
    throw new Error("Rent Request not found");
  }

  if (wantToDelRentRequest.borrower_id !== user.id && !user.isAdmin) {
    throw new Error("Unauthorized to delete this rent request");
  }

  return await RentRequest.destroy({
    where: { rent_request_id: rentRequestID },
  });
}
