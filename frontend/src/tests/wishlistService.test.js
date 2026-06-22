import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/api.js", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "../services/api.js";
import {
  clearCachedRecommendation,
  readCachedRecommendation,
  saveCachedRecommendation,
} from "../services/recommendationCache.js";
import {
  fetchRecommendations,
  primeRecommendationCache,
} from "../services/recommendationService.js";
import {
  createRecord,
  fetchRecordById,
  fetchRecords,
  fetchRecordsByVenue,
  updateRecord,
} from "../services/recordService.js";
import {
  fetchVenueById,
  fetchVenueReviews,
  fetchVenues,
} from "../services/venueService.js";
import {
  addToWishlist,
  checkWishlistStatus,
  listWishlist,
  removeFromWishlist,
} from "../services/wishlistService.js";
import { saveAccessToken } from "../services/tokenStorage.js";

describe("wishlistService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps wishlist API endpoints", () => {
    addToWishlist("venue-1");
    removeFromWishlist("venue-1");
    checkWishlistStatus("venue-1");
    listWishlist();

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/wishlists/", {
      method: "POST",
      body: JSON.stringify({ venue_id: "venue-1" }),
    });
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/wishlists/venue-1", {
      method: "DELETE",
    });
    expect(apiRequest).toHaveBeenNthCalledWith(3, "/wishlists/venue-1/status");
    expect(apiRequest).toHaveBeenNthCalledWith(4, "/wishlists/");
  });
});

