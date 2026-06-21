/**
 * Reference test: authService.js
 *
 * Pattern: testing service modules that wrap API calls.
 * We mock the `apiRequest` function from api.js so no real HTTP calls are made.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, loginUser, getCurrentUser } from "../services/authService.js";

vi.mock("../services/api.js", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "../services/api.js";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registerUser calls POST /auth/register with user data", async () => {
    const user = { name: "Alice", email: "a@test.com", password: "12345678" };
    apiRequest.mockResolvedValue({ id: "uuid", ...user });

    const result = await registerUser(user);

    expect(apiRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });
    expect(result.email).toBe("a@test.com");
  });

  it("loginUser calls POST /auth/login with credentials", async () => {
    const creds = { email: "a@test.com", password: "12345678" };
    apiRequest.mockResolvedValue({ access_token: "tok", user: {} });

    const result = await loginUser(creds);

    expect(apiRequest).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify(creds),
    });
    expect(result.access_token).toBe("tok");
  });

  it("getCurrentUser calls GET /auth/me", async () => {
    apiRequest.mockResolvedValue({ id: "uuid", name: "Alice" });

    const result = await getCurrentUser();

    expect(apiRequest).toHaveBeenCalledWith("/auth/me");
    expect(result.name).toBe("Alice");
  });
});
