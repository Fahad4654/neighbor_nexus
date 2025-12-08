import { Tool } from "../models/Tools";

export interface ToolWithDistance extends Tool {
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationText: string;
}

export type ToolSortableFields =
  | "listing_type"
  | "title"
  | "description"
  | "hourly_price"
  | "daily_price"
  | "security_deposit"
  | "is_available"
  | "distance";

export interface SortOption {
  column: ToolSortableFields;
  order: "ASC" | "DESC";
}
