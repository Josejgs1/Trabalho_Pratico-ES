import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthShell } from "../components/auth/authShell.jsx";
import { LoginForm } from "../components/auth/loginForm.jsx";
import { ProtectedPage } from "../components/auth/protectedPage.jsx";
import { RegisterForm } from "../components/auth/registerForm.jsx";

vi.mock("../services/authService.js", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("../services/tokenStorage.js", () => ({
  clearAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

import { getCurrentUser } from "../services/authService.js";
import {
  clearAccessToken,
  getAccessToken,
} from "../services/tokenStorage.js";

describe("ProtectedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/passport",
        search: "?tab=records",
        replace: vi.fn(),
      },
    });
  });

  it("redirects visitors without a token", () => {
    getAccessToken.mockReturnValue(null);

    render(
      <ProtectedPage>
        <p>Conteúdo privado</p>
      </ProtectedPage>,
    );

    expect(window.location.replace).toHaveBeenCalledWith(
      "/login?next=%2Fpassport%3Ftab%3Drecords",
    );
    expect(screen.getByText("Verificando sua sessão...")).toBeInTheDocument();
  });

  it("renders children after the current user is confirmed", async () => {
    getAccessToken.mockReturnValue("token-1");
    getCurrentUser.mockResolvedValue({ id: "user-1" });

    render(
      <ProtectedPage>
        <p>Conteúdo privado</p>
      </ProtectedPage>,
    );

    expect(await screen.findByText("Conteúdo privado")).toBeInTheDocument();
  });

  it("clears the token and redirects when the session check fails", async () => {
    getAccessToken.mockReturnValue("token-1");
    getCurrentUser.mockRejectedValue(new Error("expired"));

    render(
      <ProtectedPage>
        <p>Conteúdo privado</p>
      </ProtectedPage>,
    );

    await waitFor(() => {
      expect(clearAccessToken).toHaveBeenCalled();
      expect(window.location.replace).toHaveBeenCalledWith(
        "/login?next=%2Fpassport%3Ftab%3Drecords",
      );
    });
  });
});
