const ACCESS_TOKEN_KEY = "kulti_access_token";
const RECOMMENDATION_CACHE_KEY = "kulti_recommendation";

export function saveAccessToken(token) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(RECOMMENDATION_CACHE_KEY);
}
