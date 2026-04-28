import { apiRequest } from "./api.js";

export function addToWishlist(venueId) {
  return apiRequest("/wishlists/", {
    method: "POST",
    body: JSON.stringify({ venue_id: venueId }),
  });
}

export function removeFromWishlist(venueId) {
  return apiRequest(`/wishlists/${venueId}`, { method: "DELETE" });
}

export function checkWishlistStatus(venueId) {
  return apiRequest(`/wishlists/${venueId}/status`);
}
