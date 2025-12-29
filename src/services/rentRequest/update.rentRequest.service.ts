import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { User } from "../../models/User";

export async function updateRentRequest(
  data: Partial<RentRequest> & { id: string }
) {
  const rentRequest = await RentRequest.findOne({ where: { id: data.id } });
  if (!rentRequest) throw new Error("Rent Request not found");

  const allowedFields: Array<keyof RentRequest> = [
    "rent_status",
    "duration_unit",
    "duration_value",
    "pickup_time",
    "actual_pickup_time",
    "actual_drop_off_time",
    "borrower_rated",
    "lender_rated",
    "cancellation_reason",
  ];

  const updates: Partial<RentRequest> = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  // Handle Logic for Timing and Pricing
  const hasTimingChange =
    updates.pickup_time || updates.duration_unit || updates.duration_value;

  if (hasTimingChange) {
    const tool = await Tool.findByPk(rentRequest.listing_id);
    if (!tool) throw new Error("Tool not found");

    const finalPickup = updates.pickup_time
      ? new Date(updates.pickup_time)
      : new Date(rentRequest.pickup_time);
    const finalUnit = updates.duration_unit || rentRequest.duration_unit;
    const finalValue =
      updates.duration_value !== undefined
        ? Number(updates.duration_value)
        : Number(rentRequest.duration_value);

    let msToAdd = 0;
    let newPrice = 0;

    switch (finalUnit) {
      case "Hour":
        msToAdd = finalValue * 3600000;
        newPrice = Number(tool.hourly_price) * finalValue;
        break;
      case "Day":
        msToAdd = finalValue * 86400000;
        newPrice = Number(tool.daily_price) * finalValue;
        break;
      case "Week":
        msToAdd = finalValue * 604800000;
        newPrice = Number(tool.daily_price) * finalValue * 7;
        break;
    }

    updates.pickup_time = finalPickup;
    updates.drop_off_time = new Date(finalPickup.getTime() + msToAdd);
    updates.rental_price = newPrice;
  }

  await rentRequest.update(updates);

  // Return fresh data with associations
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
