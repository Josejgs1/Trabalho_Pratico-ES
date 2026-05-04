const RECOMMENDATION_CACHE_KEY = "kulti_recommendation";

export function readCachedRecommendation(token) {
  if (!token) return null;

  const rawValue = window.localStorage.getItem(RECOMMENDATION_CACHE_KEY);
  if (!rawValue) return null;

  try {
    const cached = JSON.parse(rawValue);
    if (cached?.token !== token) return null;
    return cached.recommendation ?? null;
  } catch {
    window.localStorage.removeItem(RECOMMENDATION_CACHE_KEY);
    return null;
  }
}

export function saveCachedRecommendation(token, recommendation) {
  if (!token || !recommendation) return;

  window.localStorage.setItem(
    RECOMMENDATION_CACHE_KEY,
    JSON.stringify({ token, recommendation }),
  );
}

export function clearCachedRecommendation() {
  window.localStorage.removeItem(RECOMMENDATION_CACHE_KEY);
}
