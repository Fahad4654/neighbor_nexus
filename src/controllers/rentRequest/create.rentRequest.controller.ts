import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { createRentRequest } from "../../services/rentRequest/create.rentRequest.service";
import { findToolsByListingId } from "../../services/tools/find.tool.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { RentRequest } from "../../models/RentRequest";
import { Op } from "sequelize";

export const createRentRequesController = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Authorization
    if (req.user?.isAdmin) {
      return errorResponse(res, "Forbidden", "Admins cannot rent tools", 403);
    }
    const currentUserId = req.user?.id;

    // 2. Validation
    const reqBodyValidation = validateRequiredBody(req, res, [
      "listing_id",
      "duration_unit",
      "duration_value",
      "pickup_time",
    ]);
    if (!reqBodyValidation) return;

    const { listing_id, duration_unit, duration_value, pickup_time } = req.body;

    // 3. Tool Check
    const tool = await findToolsByListingId(listing_id);
    if (!tool || !tool.is_available || !tool.is_approved) {
      return errorResponse(res, "Tool unavailable", "Tool not found or not ready for rent.", 400);
    }

    if (tool.owner_id === currentUserId) {
      return errorResponse(res, "Forbidden", "You cannot rent your own tool.", 403);
    }

    // 4. Time Logic: Must be MORE than 48 hours away
    const pickupDate = new Date(pickup_time);
    const now = new Date();
    
    // Calculate the threshold (Exactly 48 hours from this very second)
    const threshold = new Date(now.getTime() + (48 * 60 * 60 * 1000));

    // Check for invalid date strings
    if (isNaN(pickupDate.getTime())) {
      return errorResponse(res, "Invalid Date", "The date format provided is invalid. Use ISO format.", 400);
    }

    /**
     * Logic: 
     * If pickupDate is Dec 31 and Now is Dec 28 -> Success (3 days difference)
     * If pickupDate is Dec 29 and Now is Dec 28 -> Error (Only 1 day difference)
     */
    if (pickupDate < threshold) {
      return errorResponse(
        res, 
        "Booking window error", 
        "Pickup must be at least 48 hours from now to allow the lender time to prepare.", 
        400
      );
    }

    // 5. Overlap Check (Only for Completed/approved rentals)
    const duration = Number(duration_value);
    const end = new Date(pickupDate);

    if (duration_unit === "Hour") end.setHours(pickupDate.getHours() + duration);
    else if (duration_unit === "Day") end.setDate(pickupDate.getDate() + duration);
    else if (duration_unit === "Week") end.setDate(pickupDate.getDate() + (duration * 7));

    const overlappingRequest = await RentRequest.findOne({
      where: {
        listing_id: listing_id,
        rent_status: { [Op.in]: ["Approved", "Completed", "Cancelled"] },
        [Op.and]: [
          { pickup_time: { [Op.lt]: end } },
          { drop_off_time: { [Op.gt]: pickupDate } }
        ]
      }
    });

    if (overlappingRequest) {
      return errorResponse(res, "Conflict", "The tool is already booked for these dates.", 409);
    }

    // 6. Execution
    const requestPayload = {
      ...req.body,
      borrower_id: currentUserId,
      lender_id: tool.owner_id,
      drop_off_time: end,
      rent_status: "Requested",
    };

    console.log("Request Payload", requestPayload);

    const newRentRequest = await createRentRequest(requestPayload);

    return successResponse(res, "Rent Request created successfully", { rentRequest: newRentRequest }, 201);
  },
  "Error creating Rent Request"
);