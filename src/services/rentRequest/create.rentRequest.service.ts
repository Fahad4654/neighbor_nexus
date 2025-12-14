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
  actual_pickup_time: Date;
  actual_drop_off_time: Date;
  borrower_rated: boolean;
  lender_rated: boolean;
}) {
  if (!data.rent_status) data.rent_status = "Requested";

  const rentRequest = await RentRequest.create(data);

  return rentRequest;
}
