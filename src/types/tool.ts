import { Tool } from "../models/Tools";

export interface ToolWithDistance extends Tool {
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationText: string;
}
