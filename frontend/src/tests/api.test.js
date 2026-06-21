import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "../services/api.js";
import { saveAccessToken } from "../services/tokenStorage.js";

describe("apiRequest", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/map",
        search: "?venue=1",
        replace: vi.fn(),
      },
    });
  });

  it("sends JSON headers and bearer token when available", async () => {
    saveAccessToken("token-1");
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
    });

    await expect(apiRequest("/venues", { headers: { "X-Test": "1" } })).resolves.toEqual({
      ok: true,
    });

    expect(fetch).toHaveBeenCalledWith("/venues", {
      headers: {
        "Content-Type": "application/json",
        "X-Test": "1",
        Authorization: "Bearer token-1",
      },
    });
  });

  it("returns null when a successful response has no JSON body", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error("empty body")),
    });

    await expect(apiRequest("/records")).resolves.toBeNull();
  });

  it("throws API detail messages for failed requests", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({
        detail: [{ msg: "Email inválido" }, { msg: "Senha curta" }],
      }),
    });

    await expect(apiRequest("/auth/register")).rejects.toThrow(
      "Email inválido, Senha curta",
    );
  });

  it("redirects authenticated pages to login after unauthorized responses", async () => {
    saveAccessToken("token-1");
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ detail: "Sessão expirada" }),
    });

    await expect(apiRequest("/auth/me")).rejects.toThrow("Sessão expirada");

    expect(localStorage.getItem("kulti_access_token")).toBeNull();
    expect(window.location.replace).toHaveBeenCalledWith(
      "/login?next=%2Fmap%3Fvenue%3D1",
    );
  });

  it("does not redirect public pages after unauthorized responses", async () => {
    window.location.pathname = "/login";
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(apiRequest("/auth/login")).rejects.toThrow("Erro na requisição.");

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
