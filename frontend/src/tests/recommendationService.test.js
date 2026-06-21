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

describe("recommendationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("returns cached recommendations before calling the API", async () => {
    saveAccessToken("token-1");
    saveCachedRecommendation("token-1", { title: "Cached" });

    await expect(fetchRecommendations()).resolves.toEqual({ title: "Cached" });
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("fetches and caches fresh recommendations", async () => {
    saveAccessToken("token-1");
    apiRequest.mockResolvedValue({ title: "Fresh" });

    await expect(fetchRecommendations({ forceRefresh: true })).resolves.toEqual({
      title: "Fresh",
    });

    expect(apiRequest).toHaveBeenCalledWith("/recommendations");
    expect(readCachedRecommendation("token-1")).toEqual({ title: "Fresh" });
  });

  it("primes the cache by clearing stale values first", async () => {
    saveAccessToken("token-1");
    saveCachedRecommendation("token-1", { title: "Old" });
    apiRequest.mockResolvedValue({ title: "New" });

    await expect(primeRecommendationCache()).resolves.toEqual({ title: "New" });

    expect(readCachedRecommendation("token-1")).toEqual({ title: "New" });
  });
});
