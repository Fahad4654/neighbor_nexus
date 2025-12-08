export interface SortOption {
  column: string; // e.g., 'listing_type', 'hourly_price', 'distanceMeters'
  order: "ASC" | "DESC";
}
