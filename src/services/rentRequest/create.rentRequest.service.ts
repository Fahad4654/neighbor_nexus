import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";

export async function createRentRequest(data: {
  listing_id: string;
  borrower_id: string;
  lender_id?: string;
  rent_status?: string;
  duration_unit: string;
  duration_value: number;
  pickup_time: Date;
  drop_off_time?: Date;
  rental_price?: number;
  actual_pickup_time: Date | null;
  actual_drop_off_time: Date | null;
  borrower_rated: boolean;
  lender_rated: boolean;
}) {
  if (!data.rent_status) data.rent_status = "Requested";
  if (!data.borrower_rated) data.borrower_rated = false;
  if (!data.lender_rated) data.lender_rated = false;
  if (!data.actual_drop_off_time) data.actual_drop_off_time = null;
  if (!data.actual_pickup_time) data.actual_pickup_time = null;
  const tool = await Tool.findOne({
    where: { listing_id: data.listing_id },
  });
  if (!tool) throw new Error("Tool not found");
  if (!data.lender_id) data.lender_id = tool.owner_id;
  if (!data.rental_price) {
    if (data.duration_unit === "Hour")
      data.rental_price =
        Number(tool.hourly_price) * Number(data.duration_value);
    if (data.duration_unit === "Day")
      data.rental_price =
        Number(tool.daily_price) * Number(data.duration_value);
    if (data.duration_unit === "Week")
      data.rental_price =
        Number(tool.daily_price) * Number(data.duration_value) * 7;
  }
  if (typeof data.pickup_time === "string") {
    data.pickup_time = new Date(data.pickup_time);
  }
  if (isNaN(data.pickup_time.getTime())) {
    throw new Error("Invalid format for pickup_time");
  }
  if (!data.drop_off_time) {
    if (data.duration_unit === "Hour")
      data.drop_off_time = new Date(
        data.pickup_time.getTime() +
          Number(data.duration_value) * 60 * 60 * 1000
      );
    if (data.duration_unit === "Day")
      data.drop_off_time = new Date(
        data.pickup_time.getTime() +
          Number(data.duration_value) * 24 * 60 * 60 * 1000
      );
    if (data.duration_unit === "Week")
      data.drop_off_time = new Date(
        data.pickup_time.getTime() +
          Number(data.duration_value) * 7 * 24 * 60 * 60 * 1000
      );
  }
  const rentRequest = await RentRequest.create(data);

  return rentRequest;
}
