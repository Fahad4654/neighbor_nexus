import { Op, Model, ModelStatic } from "sequelize";

/**
 * Predefined allowed fields per model.
 * This acts as your security whitelist.
 */
const ALLOWED_SEARCH_FIELDS: Record<string, string[]> = {
  Profile: ["userId", "bio", "address"],
  RentRequest: [
    "rent_status",
    "duration_unit",
    "duration_value",
    "rental_price",
    "cancellation_reason",
  ],
  Review: ["transaction_id", "lender_id", "borrower_id", "rating", "comment"],

  Tool: [
    "listing_type",
    "title",
    "description",
    "hourly_price",
    "daily_price",
    "security_deposit",
    "is_available",
    "rental_count",
    "is_approved",
    "geo_location",
  ],
  Transaction: [
    "listing_id",
    "borrower_id",
    "lender_id",
    "rent_request_id",
    "start_time",
    "end_time",
    "total_fee",
    "platform_commission",
    "deposit_amount",
    "status",
  ],
  User: [
    "username",
    "firstname",
    "lastname",
    "email",
    "phoneNumber",
    "geo_location",
  ],
  // Add other models here...
};

export const getSearchWhereClause = (
  search?: string,
  ModelClass?: ModelStatic<Model>,
  searchBy?: string
) => {
  if (!search || !ModelClass) return {};

  const modelName = ModelClass.name;
  const allowedFields = ALLOWED_SEARCH_FIELDS[modelName] || [];
  const attributes = ModelClass.getAttributes();

  /**
   * Internal helper to determine the correct operator based on DB type
   */
  const getSearchCondition = (fieldName: string) => {
    // 1. Security: Check if the field is in our predefined allowed list
    if (!allowedFields.includes(fieldName)) return null;

    // 2. Metadata: Get the actual DB type from the model file
    const attr = attributes[fieldName];
    if (!attr) return null;

    const typeName = attr.type.constructor.name;

    // String-based types (Safe for iLike)
    // character, character varying, text, name
    if (["STRING", "TEXT", "CHAR", "CITEXT"].includes(typeName)) {
      return { [fieldName]: { [Op.iLike]: `%${search}%` } };
    }

    // Exact types (Safe for =)
    // integer, bigint, numeric, double precision, uuid, boolean, USER-DEFINED, timestamp
    return { [fieldName]: { [Op.eq]: search } };
  };

  // --- Specific Field Search Logic ---
  if (searchBy) {
    const condition = getSearchCondition(searchBy);
    return condition ? condition : {};
  }

  // --- Default Cross-Field Search (Op.or) ---
  // Uses only the predefined allowed fields for this specific model
  const orConditions = allowedFields
    .map((field) => getSearchCondition(field))
    .filter(Boolean); // Removes nulls (safety check)

  return orConditions.length > 0 ? { [Op.or]: orConditions } : {};
};
