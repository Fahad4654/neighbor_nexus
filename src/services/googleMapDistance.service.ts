import axios from "axios";
import { GOOGLE_MAP_API_KEY } from "../config";

export async function getDistanceBetweenPoints(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAP_API_KEY}`;

  const response = await axios.get(url);
  const data = response.data;

  if (data.status !== "OK") throw new Error("Google API error");

  const element = data.rows[0].elements[0];
  if (element.status !== "OK") throw new Error("Distance not found");

  return {
    distanceMeters: element.distance.value,
    distanceText: element.distance.text,
    durationSeconds: element.duration.value,
    durationText: element.duration.text,
  };
}
