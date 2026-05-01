import { apiRequest } from "./api.js";

function toQueryString(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export function fetchVenues(params = {}) {
  const query = toQueryString(params);
  return apiRequest(query ? `/venues?${query}` : "/venues");
}

export function fetchVenueById(id) {
  return apiRequest(`/venues/${id}`);
}
