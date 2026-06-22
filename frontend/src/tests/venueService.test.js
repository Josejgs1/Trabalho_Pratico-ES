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

describe("venueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds venue queries and skips empty filters", () => {
    fetchVenues({ q: "MASP", category: "", city: null, limit: 10 });
    fetchVenues();
    fetchVenueById("venue-1");
    fetchVenueReviews("venue-1");

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/venues?q=MASP&limit=10");
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/venues");
    expect(apiRequest).toHaveBeenNthCalledWith(3, "/venues/venue-1");
    expect(apiRequest).toHaveBeenNthCalledWith(4, "/venues/venue-1/reviews");
  });
});

