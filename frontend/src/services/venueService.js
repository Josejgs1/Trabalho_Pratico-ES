import { apiRequest } from "./api.js";

export function fetchVenues() {
  return apiRequest("/venues");
}
