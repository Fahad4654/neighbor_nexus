import { RentRequest } from "../../models/RentRequest";

export async function updateUser(data: Partial<RentRequest> & { id: string }) {
  const rentRequest = await RentRequest.findOne({ where: { id: data.id } });
  if (!rentRequest) {
    console.log("Rent Request not found for update");
    throw new Error("Rent Request not found");
  }

  const allowedFields: Array<keyof RentRequest> = [
    "rent_status",
    "duration_unit",
    "duration_value",
    "pickup_time",
    "drop_off_time",
    "rental_price",
    "actual_pickup_time",
    "actual_drop_off_time",
    "borrower_rated",
    "lender_rated",
  ];
  const updates: Partial<RentRequest> = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (Object.keys(updates).length === 0) {
    console.log("No valid fields provided for update");
    throw new Error("No valid fields provided for update");
  }

  await rentRequest.update(updates);
  return RentRequest.findByPk(rentRequest.id, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
}
