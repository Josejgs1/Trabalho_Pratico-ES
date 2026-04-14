const ACCESS_TOKEN_KEY = "kulti_access_token";

export function saveAccessToken(token) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}
