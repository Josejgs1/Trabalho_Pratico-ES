import { apiRequest } from "./api.js";

export function fetchVenues() {
  return apiRequest("/venues");
}

export function fetchVenueById(id) {
  return apiRequest(`/venues/${id}`);
}