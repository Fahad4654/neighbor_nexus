import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { User } from "../../models/User";

export async function updateRentRequest(
  data: Partial<RentRequest> & { id: string }
) {
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
    // "drop_off_time",
    "actual_pickup_time",
    "actual_drop_off_time",
    "borrower_rated",
    "lender_rated",
    "cancellation_reason",
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

  if (updates.pickup_time) {
    if (typeof updates.pickup_time === "string") {
      updates.pickup_time = new Date(updates.pickup_time);
    }
    if (isNaN(updates.pickup_time.getTime())) {
      throw new Error("Invalid format for pickup_time");
    }
    if (rentRequest.duration_unit === "Hour")
      updates.drop_off_time = new Date(
        updates.pickup_time.getTime() +
          Number(rentRequest.duration_value) * 60 * 60 * 1000
      );
    if (rentRequest.duration_unit === "Day")
      updates.drop_off_time = new Date(
        updates.pickup_time.getTime() +
          Number(rentRequest.duration_value) * 24 * 60 * 60 * 1000
      );
    if (rentRequest.duration_unit === "Week")
      data.drop_off_time = new Date(
        updates.pickup_time.getTime() +
          Number(rentRequest.duration_value) * 7 * 24 * 60 * 60 * 1000
      );
  }

  await rentRequest.update(updates);
  return RentRequest.findByPk(rentRequest.id, {
    include: [
      {
        model: Tool,
        as: "listing",
        attributes: [
          "listing_id",
          "title",
          "is_available",
          "rental_count",
          "is_approved",
          "geo_location",
        ],
      },
      {
        model: User,
        as: "borrower",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
      {
        model: User,
        as: "lender",
        attributes: [
          "id",
          "username",
          "firstname",
          "lastname",
          "email",
          "phoneNumber",
        ],
      },
    ],
  });
}
