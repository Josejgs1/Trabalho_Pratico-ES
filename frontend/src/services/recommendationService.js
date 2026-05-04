import { apiRequest } from "./api.js";
import { getAccessToken } from "./tokenStorage.js";
import {
  clearCachedRecommendation,
  readCachedRecommendation,
  saveCachedRecommendation,
} from "./recommendationCache.js";

export async function fetchRecommendations({ forceRefresh = false } = {}) {
  const token = getAccessToken();

  if (!forceRefresh) {
    const cachedRecommendation = readCachedRecommendation(token);
    if (cachedRecommendation) return cachedRecommendation;
  }

  const recommendation = await apiRequest("/recommendations");
  saveCachedRecommendation(token, recommendation);
  return recommendation;
}

export async function primeRecommendationCache() {
  clearCachedRecommendation();
  return fetchRecommendations({ forceRefresh: true });
}
