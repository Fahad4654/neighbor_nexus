import { RentRequest } from "../../models/RentRequest";

export async function createRentRequest(data: {
  listing_id: string;
  borrower_id: string;
  lender_id: string;
  rent_status?: string;
  duration_unit: string;
  duration_value: number;
  pickup_time: Date;
  drop_off_time: Date;
  rental_price: number;
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

  const rentRequest = await RentRequest.create(data);

  return rentRequest;
}
