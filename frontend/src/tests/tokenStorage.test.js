/**
 * Reference test: tokenStorage.js
 *
 * Pattern: testing pure utility functions that use browser APIs (localStorage).
 * jsdom provides a working localStorage, so no manual mocking is needed.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { saveAccessToken, getAccessToken, clearAccessToken } from "../services/tokenStorage.js";

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and retrieves a token", () => {
    saveAccessToken("my-token");
    expect(getAccessToken()).toBe("my-token");
  });

  it("returns null when no token is saved", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("clears the token and recommendation cache", () => {
    localStorage.setItem("kulti_access_token", "abc");
    localStorage.setItem("kulti_recommendation", "cached");

    clearAccessToken();

    expect(localStorage.getItem("kulti_access_token")).toBeNull();
    expect(localStorage.getItem("kulti_recommendation")).toBeNull();
  });
});
