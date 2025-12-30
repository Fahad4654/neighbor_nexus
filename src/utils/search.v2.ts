import { Op, Model, ModelStatic, literal } from "sequelize"; // Import literal here

/**
 * Predefined allowed fields per model.
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
 * Generates a Sequelize where clause.
 * Prevents application crashes by returning a non-matching condition on error.
 */
export const getSearchWhereClause = (
  search?: string,
  ModelClass?: ModelStatic<Model>,
  searchBy?: string
) => {
  if (!search || !ModelClass) return {};

  const modelName = ModelClass.name;
  const allowedFields = ALLOWED_SEARCH_FIELDS[modelName];

  /**
   * If model is not registered, log error and return a condition that matches nothing.
   * Using literal('1=0') ensures the query returns no results safely.
   */
  if (!allowedFields) {
    console.error(
      `[Search Error]: Model "${modelName}" is not configured in whitelist.`
    );
    return { [Op.and]: [literal("1=0")] };
  }

  /**
   * If searchBy is provided but not allowed, log error and return 1=0.
   */
  if (searchBy && !allowedFields.includes(searchBy)) {
    console.error(
      `[Search Error]: Column "${searchBy}" is not allowed for model: ${modelName}`
    );
    return { [Op.and]: [literal("1=0")] };
  }

  const attributes = ModelClass.getAttributes();

  const getSearchCondition = (fieldName: string) => {
    const attr = attributes[fieldName];
    if (!attr) return null;

    const typeName = attr.type.constructor.name;

    // 1. Partial Match (iLike): character, text, varying, name
    const stringTypes = ["STRING", "TEXT", "CHAR", "CITEXT"];
    if (stringTypes.includes(typeName)) {
      return { [fieldName]: { [Op.iLike]: `%${search}%` } };
    }

    // 2. Array Match: ARRAY
    if (typeName === "ARRAY") {
      return { [fieldName]: { [Op.contains]: [search] } };
    }

    // 3. Exact Match (eq): int, numeric, uuid, boolean, bigint, double, USER-DEFINED, timestamp
    return { [fieldName]: { [Op.eq]: search } };
  };

  // Logic for SEARCH BY SPECIFIC FIELD
  if (searchBy) {
    const condition = getSearchCondition(searchBy);
    if (!condition) {
      console.error(
        `[Search Error]: Field "${searchBy}" does not exist in ${modelName} database attributes.`
      );
      return { [Op.and]: [literal("1=0")] };
    }
    return condition;
  }

  // Logic for DEFAULT MULTI-FIELD SEARCH (OR)
  const orConditions = allowedFields
    .map((field) => getSearchCondition(field))
    .filter((cond): cond is Record<string, any> => cond !== null);

  return orConditions.length > 0 ? { [Op.or]: orConditions } : {};
};
