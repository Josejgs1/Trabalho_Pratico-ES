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

