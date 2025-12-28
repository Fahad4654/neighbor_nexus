import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { User } from "../../models/User";
import { findByDynamicId } from "../global/find.service";

export async function updateRentRequest(
  data: Partial<RentRequest> & { id: string }
) {
  // 1. Fetch existing request
  const rentRequest = await RentRequest.findOne({ where: { id: data.id } });
  if (!rentRequest) {
    throw new Error("Rent Request not found");
  }

  // 2. Filter allowed fields
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
    if (data[key] !== undefined) {
      updates[key] = data[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  // 3. Fetch Tool (needed for price calculation)
  const typedTool = await findByDynamicId(
    Tool,
    { listing_id: rentRequest.listing_id },
    false
  );
  const tool = typedTool as Tool | null;
  if (!tool) {
    throw new Error("Tool associated with this request not found");
  }

  // 4. Handle Logic for Timing and Pricing
  // We use the new update if provided, otherwise fallback to the existing database value
  const hasTimingChange =
    updates.pickup_time !== undefined ||
    updates.duration_unit !== undefined ||
    updates.duration_value !== undefined;

  if (hasTimingChange) {
    // Determine working values
    const finalPickup = updates.pickup_time
      ? new Date(updates.pickup_time)
      : new Date(rentRequest.pickup_time);
    const finalUnit = updates.duration_unit || rentRequest.duration_unit;
    const finalValue =
      updates.duration_value !== undefined
        ? Number(updates.duration_value)
        : Number(rentRequest.duration_value);

    if (isNaN(finalPickup.getTime())) {
      throw new Error("Invalid format for pickup_time");
    }

    let msToAdd = 0;
    let newPrice = 0;

    // Calculate based on unit
    switch (finalUnit) {
      case "Hour":
        msToAdd = finalValue * 60 * 60 * 1000;
        newPrice = Number(tool.hourly_price) * finalValue;
        break;
      case "Day":
        msToAdd = finalValue * 24 * 60 * 60 * 1000;
        newPrice = Number(tool.daily_price) * finalValue;
        break;
      case "Week":
        msToAdd = finalValue * 7 * 24 * 60 * 60 * 1000;
        newPrice = Number(tool.daily_price) * finalValue * 7;
        break;
      default:
        throw new Error("Invalid duration unit");
    }

    // Assign calculated values to the update object
    updates.pickup_time = finalPickup;
    updates.drop_off_time = new Date(finalPickup.getTime() + msToAdd);
    updates.rental_price = newPrice;
  }

  // 5. Apply updates to database
  await rentRequest.update(updates);

  // 6. Return fresh data with associations
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
