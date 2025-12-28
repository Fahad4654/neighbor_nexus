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
    if (req.user?.isAdmin) {
      return errorResponse(res, "Forbidden", "Admin accounts cannot create Rent Requests", 403);
    }

    const reqBodyValidation = validateRequiredBody(req, res, [
      "listing_id",
      "duration_unit",
      "duration_value",
      "pickup_time",
    ]);
    if (!reqBodyValidation) return;

    const currentUserId = req.user?.id;
    const { listing_id, duration_unit, duration_value, pickup_time } = req.body;

    // 1. Tool Verification
    const tool = await findToolsByListingId(listing_id);
    if (!tool) {
      return errorResponse(res, "Tool not found", `Tool with ID ${listing_id} does not exist`, 404);
    }

    if (!tool.is_available || !tool.is_approved) {
      return errorResponse(res, "Tool unavailable", "This tool is currently not available or approved.", 400);
    }

    if (tool.owner_id === currentUserId) {
      return errorResponse(res, "Forbidden", "You cannot rent your own tool.", 403);
    }

    // 2. Date Calculation
    const start = new Date(pickup_time);
    const duration = Number(duration_value);
    let end = new Date(start);

    if (duration_unit === "Hour") end.setHours(start.getHours() + duration);
    else if (duration_unit === "Day") end.setDate(start.getDate() + duration);
    else if (duration_unit === "Week") end.setDate(start.getDate() + (duration * 7));

    const now = new Date();
    const maxAllowedDate = new Date();
    maxAllowedDate.setHours(now.getHours() + 48);

    if (isNaN(start.getTime())) {
      return errorResponse(res, "Invalid Date", "Invalid pickup time format.", 400);
    }

    if (start < now || start > maxAllowedDate) {
      return errorResponse(res, "Invalid Time", "Pickup must be within the next 48 hours.", 400);
    }

    // 3. Overlap Check (The Core Change)
    // Find any approved/active requests that overlap with these dates
    const overlappingRequest = await RentRequest.findOne({
      where: {
        listing_id: listing_id,
        rent_status: { [Op.in]: ["Approved", "Confirmed", "PickedUp"] },
        [Op.or]: [
          {
            // Case 1: New start is inside an existing range
            pickup_time: { [Op.lte]: start },
            drop_off_time: { [Op.gt]: start }
          },
          {
            // Case 2: New end is inside an existing range
            pickup_time: { [Op.lt]: end },
            drop_off_time: { [Op.gte]: end }
          },
          {
            // Case 3: New range completely swallows an existing range
            pickup_time: { [Op.gte]: start },
            drop_off_time: { [Op.lte]: end }
          }
        ]
      }
    });

    if (overlappingRequest) {
      return errorResponse(
        res, 
        "Conflict", 
        "The tool is already booked for the selected dates/times.", 
        409
      );
    }

    // 4. Creation
    const requestPayload = {
      ...req.body,
      borrower_id: currentUserId,
      lender_id: tool.owner_id,
      drop_off_time: end // Explicitly pass the calculated end time
    };

    const newRentRequest = await createRentRequest(requestPayload);

    return successResponse(res, "Rent Request created successfully", { rentRequest: newRentRequest }, 201);
  },
  "Error creating Rent Request"
);