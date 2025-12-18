import { RentRequest } from "../../models/RentRequest";
import { User } from "../../models/User";
import { findByDynamicId } from "../global/find.service";

export async function deleteRentRequest(rentRequestID: string, user: User) {
  const typedWantToDelRentRequest = await findByDynamicId(
    RentRequest,
    {
      id: rentRequestID,
    },
    false
  );
  const wantToDelRentRequest = typedWantToDelRentRequest as RentRequest | null;

  if (!wantToDelRentRequest) {
    throw new Error("Rent Request not found");
  }

  if (wantToDelRentRequest.borrower_id !== user.id && !user.isAdmin) {
    throw new Error("Unauthorized to delete this rent request");
  }

  return await RentRequest.destroy({
    where: { id: rentRequestID },
  });
}
