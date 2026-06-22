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

describe("recordService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps record API endpoints", () => {
    fetchRecords();
    fetchRecordsByVenue("venue-1");
    fetchRecordById("record-1");
    createRecord({ venue_id: "venue-1", rating: 5 });
    updateRecord("record-1", { rating: 4 });

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/records/");
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/records?venue_id=venue-1");
    expect(apiRequest).toHaveBeenNthCalledWith(3, "/records/record-1");
    expect(apiRequest).toHaveBeenNthCalledWith(4, "/records/", {
      method: "POST",
      body: JSON.stringify({ venue_id: "venue-1", rating: 5 }),
    });
    expect(apiRequest).toHaveBeenNthCalledWith(5, "/records/record-1", {
      method: "PUT",
      body: JSON.stringify({ rating: 4 }),
    });
  });
});

