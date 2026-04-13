import { apiRequest } from "./api.js";

export function registerUser(user) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(user),
  });
}
