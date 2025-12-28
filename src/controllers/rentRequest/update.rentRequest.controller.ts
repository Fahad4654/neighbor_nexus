import { Request, Response } from "express";
import { findByRentRequestId } from "../../services/rentRequest/findAll.rentRequest.service";
import { updateRentRequest } from "../../services/rentRequest/update.rentRequest.service";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { RentRequest } from "../../models/RentRequest";
import { Tool } from "../../models/Tools";
import { createTransaction } from "../../services/transacion/create.transacion.service";
import { COMMISSION } from "../../config";
import { findTransactionsByRentRequestId } from "../../services/transacion/find.transacion.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { Op } from "sequelize";

type RentRequestUpdatableField = keyof RentRequest;

const LENDER_ALLOWED_FIELDS: RentRequestUpdatableField[] = [
  "rent_status",
  "actual_pickup_time",
  "cancellation_reason",
];
const BORROWER_ALLOWED_FIELDS: RentRequestUpdatableField[] = [
  "duration_unit",
  "duration_value",
  "pickup_time",
  "actual_drop_off_time",
  "rent_status",
];
const ADMIN_ALLOWED_FIELDS: RentRequestUpdatableField[] = [
  "rent_status",
  "duration_unit",
  "duration_value",
  "pickup_time",
  "drop_off_time",
  "actual_pickup_time",
  "actual_drop_off_time",
  "borrower_rated",
  "lender_rated",
  "cancellation_reason",
];

export const updateRentRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.id)
      return errorResponse(res, "Unauthorized", "Login is required", 401);

    const currentUserId = req.user.id;
    const validateBody = validateRequiredBody(req, res, ["rentRequest_id"]);
    if (!validateBody) return;

    const { rentRequest_id, ...updateData } = req.body;
    const rentRequest = await findByRentRequestId(rentRequest_id);

    if (!rentRequest)
      return errorResponse(
        res,
        "Rent Request not found",
        `ID ${rentRequest_id} not found`,
        404
      );

    // 1. Permission & Sanitization
    let allowedFields: RentRequestUpdatableField[] = [];
    if (currentUserId === rentRequest.lender_id) {
      allowedFields = LENDER_ALLOWED_FIELDS;
    } else if (currentUserId === rentRequest.borrower_id) {
      if (updateData.rent_status && updateData.rent_status !== "Cancelled") {
        return errorResponse(
          res,
          "Forbidden",
          "Borrowers can only cancel requests.",
          403
        );
      }
      allowedFields = BORROWER_ALLOWED_FIELDS;
    } else if (req.user.isAdmin) {
      allowedFields = ADMIN_ALLOWED_FIELDS;
    } else {
      return errorResponse(
        res,
        "Forbidden",
        "Unauthorized to update this request.",
        403
      );
    }

    const updatesToSend: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined)
        updatesToSend[field] = updateData[field];
    }

    // 2. Conflict Check (Only if status is being changed to 'Approved')
    if (updatesToSend.rent_status === "Approved") {
      // A. Transaction Guard
      const existingTransactions = await findTransactionsByRentRequestId(
        rentRequest_id,
        req.user as any
      );
      if (existingTransactions.length > 0)
        return errorResponse(
          res,
          "Conflict",
          "Transaction already exists.",
          400
        );

      // B. Overlap Logic
      const start = updatesToSend.pickup_time
        ? new Date(updatesToSend.pickup_time)
        : new Date(rentRequest.pickup_time);
      const unit = updatesToSend.duration_unit || rentRequest.duration_unit;
      const val =
        updatesToSend.duration_value !== undefined
          ? Number(updatesToSend.duration_value)
          : Number(rentRequest.duration_value);

      let end = new Date(start);
      if (unit === "Hour") end.setHours(start.getHours() + val);
      else if (unit === "Day") end.setDate(start.getDate() + val);
      else if (unit === "Week") end.setDate(start.getDate() + val * 7);

      // Check if any OTHER approved request overlaps with this timeframe
      const overlappingRequest = await RentRequest.findOne({
        where: {
          id: { [Op.ne]: rentRequest_id }, // Exclude current request
          listing_id: rentRequest.listing_id,
          rent_status: { [Op.in]: ["Approved", "Cancelled", "Completed"] },
          [Op.and]: [
            { pickup_time: { [Op.lt]: end } },
            { drop_off_time: { [Op.gt]: start } },
          ],
        },
      });

      if (overlappingRequest) {
        return errorResponse(
          res,
          "Conflict",
          "The tool is already booked for this timeframe.",
          409
        );
      }
    }

    // 3. Update execution
    const updatedRentRequest = await updateRentRequest({
      id: rentRequest_id,
      ...updatesToSend,
    });

    // 4. Transaction Creation
    let transaction = null;
    if (
      updatedRentRequest &&
      updatesToSend.rent_status === "Approved" &&
      currentUserId !== updatedRentRequest.borrower_id
    ) {
      const tool = await Tool.findByPk(updatedRentRequest.listing_id);
      transaction = await createTransaction(
        updatedRentRequest.listing_id,
        updatedRentRequest.borrower_id,
        updatedRentRequest.lender_id,
        updatedRentRequest.id,
        updatedRentRequest.pickup_time,
        updatedRentRequest.drop_off_time,
        updatedRentRequest.rental_price,
        Number(updatedRentRequest.rental_price) * (COMMISSION / 100),
        Number(tool?.security_deposit || 0),
        "",
        "Pending"
      );
    }

    return successResponse(res, "Request updated successfully", {
      rentRequest: updatedRentRequest,
      transaction,
    });
  },
  "Failed to update Rent Request"
);
