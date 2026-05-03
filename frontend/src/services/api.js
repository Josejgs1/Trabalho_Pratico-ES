import { clearAccessToken, getAccessToken } from "./tokenStorage.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

function redirectToLogin() {
  const currentPath = window.location.pathname;
  if (PUBLIC_PATHS.has(currentPath)) return;

  const next = `${currentPath}${window.location.search}`;
  clearAccessToken();
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
    }

    throw new Error(data?.detail ?? "Request failed.");
  }

  return data;
}
