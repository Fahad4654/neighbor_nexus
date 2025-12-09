export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface Coordinates {
  lat: number;
  lng: number;
}
