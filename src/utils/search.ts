import { Op } from "sequelize";

/**
 * Generates a Sequelize where clause for search functionality.
 * Supports searching by specific fields (searchBy) or across multiple default fields.
 *
 * @param search - The search term.
 * @param searchBy - Specific field to search by (optional).
 * @returns A Sequelize where clause object.
 */
export const getSearchWhereClause = (search?: string, searchBy?: string) => {
  if (!search) return {};

  if (searchBy) {
    const map: Record<string, string> = {
      listing_title: "$listing.title$",
      borrower_firstname: "$borrower.firstname$",
      borrower_lastname: "$borrower.lastname$",
      borrower_email: "$borrower.email$",
      lender_firstname: "$lender.firstname$",
      lender_lastname: "$lender.lastname$",
      lender_email: "$lender.email$",
      // Add more mappings here as needed
      title: "title",
      description: "description",
      firstname: "firstname",
      lastname: "lastname",
      email: "email",
      bio: "bio",
      address: "address",
    };

    const column = map[searchBy] || searchBy; // Fallback to using the searchBy string directly if not in map
    if (column) {
      // Check if it's an associated field (contains $) or direct field
      if (column.includes(".") || column.includes("$")) {
         return {
            [column]: { [Op.iLike]: `%${search}%` },
         };
      } else {
          return {
            [column]: { [Op.iLike]: `%${search}%` },
          };
      }
    }
  }

  // Default cross-field search behavior (specific to RentRequest/Transaction context mostly, but made generic enough?
  // The original implementation was specific to RentRequest/Transaction structure (listing, borrower, lender).
  // If we share this, we might want to make the default behavior more flexible or context-aware.
  // HOWEVER, for now, to support the specific refactoring request for RentRequest/Transaction code reuse,
  // we will keep the specific default fields here or make them configurable?
  // Let's keep the specific defaults that were repeated, as that's the primary target for refactoring.
  
  return {
    [Op.or]: [
      { "$listing.title$": { [Op.iLike]: `%${search}%` } },
      { "$borrower.firstname$": { [Op.iLike]: `%${search}%` } },
      { "$borrower.lastname$": { [Op.iLike]: `%${search}%` } },
      { "$borrower.email$": { [Op.iLike]: `%${search}%` } },
      { "$lender.firstname$": { [Op.iLike]: `%${search}%` } },
      { "$lender.lastname$": { [Op.iLike]: `%${search}%` } },
      { "$lender.email$": { [Op.iLike]: `%${search}%` } },
    ],
  };
};
