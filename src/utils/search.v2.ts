import { Op, Model, ModelStatic } from "sequelize";

/**
 * Predefined allowed fields per model.
 * This acts as a security whitelist. If a field is not here, it cannot be searched.
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
};

/**
 * Generates a Sequelize where clause with strict validation and type safety.
 * * @param search - The term to search for.
 * @param ModelClass - The Sequelize Model class.
 * @param searchBy - Optional specific column to search.
 * @throws Error if the model is not configured or the column is not allowed.
 */
export const getSearchWhereClause = (
  search?: string,
  ModelClass?: ModelStatic<Model>,
  searchBy?: string
) => {
  // If no search term or model provided, return empty object
  if (!search || !ModelClass) return {};

  const modelName = ModelClass.name;
  const allowedFields = ALLOWED_SEARCH_FIELDS[modelName];

  // 1. Validate that the Model is registered in our security config
  if (!allowedFields) {
    throw new Error(
      `Search functionality is not configured/allowed for model: ${modelName}`
    );
  }

  // 2. Validate searchBy field against the whitelist
  if (searchBy && !allowedFields.includes(searchBy)) {
    throw new Error(
      `Search by column "${searchBy}" is not allowed for model: ${modelName}`
    );
  }

  const attributes = ModelClass.getAttributes();

  /**
   * Helper to generate the correct operator based on PostgreSQL/Sequelize data type.
   * Handles: integer, ARRAY, numeric, uuid, USER-DEFINED (Enum), character,
   * timestamp, name, bigint, boolean, character varying, double precision, text.
   */
  const getSearchCondition = (fieldName: string) => {
    const attr = attributes[fieldName];
    if (!attr) return null;

    // Get the internal Sequelize type name (e.g., "STRING", "INTEGER", "ARRAY")
    const typeName = attr.type.constructor.name;

    // --- Type Group 1: Partial Match (iLike) ---
    // Best for: character, character varying, text, name
    const stringTypes = ["STRING", "TEXT", "CHAR", "CITEXT"];
    if (stringTypes.includes(typeName)) {
      return { [fieldName]: { [Op.iLike]: `%${search}%` } };
    }

    // --- Type Group 2: Array Search ---
    // Best for: ARRAY types
    if (typeName === "ARRAY") {
      return { [fieldName]: { [Op.contains]: [search] } };
    }

    // --- Type Group 3: Exact Match (eq) ---
    // Best for: integer, bigint, numeric, double precision, uuid, boolean,
    // USER-DEFINED (Enum), timestamp with time zone
    // We use [Op.eq] because partial matches (LIKE) cause errors on non-string types.
    return { [fieldName]: { [Op.eq]: search } };
  };

  // --- Logic for SEARCH BY SPECIFIC FIELD ---
  if (searchBy) {
    const condition = getSearchCondition(searchBy);

    // If field exists in whitelist but not in Model attributes (code inconsistency)
    if (!condition) {
      throw new Error(
        `Field "${searchBy}" defined in allowed list but does not exist on Model "${modelName}"`
      );
    }

    return condition;
  }

  // --- Logic for DEFAULT MULTI-FIELD SEARCH (OR) ---
  const orConditions = allowedFields
    .map((field) => getSearchCondition(field))
    .filter((cond): cond is Record<string, any> => cond !== null);

  return orConditions.length > 0 ? { [Op.or]: orConditions } : {};
};
