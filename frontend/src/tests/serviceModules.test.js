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

describe("recommendationCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads matching cached recommendations", () => {
    saveCachedRecommendation("token-1", { title: "MASP" });

    expect(readCachedRecommendation("token-1")).toEqual({ title: "MASP" });
  });

  it("ignores missing, mismatched, empty, or invalid cache values", () => {
    expect(readCachedRecommendation()).toBeNull();
    expect(readCachedRecommendation("token-1")).toBeNull();

    saveCachedRecommendation("token-1", { title: "MASP" });
    expect(readCachedRecommendation("token-2")).toBeNull();

    saveCachedRecommendation("token-1", null);
    expect(readCachedRecommendation("token-1")).toEqual({ title: "MASP" });

    localStorage.setItem("kulti_recommendation", "{bad-json");
    expect(readCachedRecommendation("token-1")).toBeNull();
    expect(localStorage.getItem("kulti_recommendation")).toBeNull();
  });

  it("clears cached recommendations", () => {
    saveCachedRecommendation("token-1", { title: "MASP" });
    clearCachedRecommendation();

    expect(readCachedRecommendation("token-1")).toBeNull();
  });
});

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
