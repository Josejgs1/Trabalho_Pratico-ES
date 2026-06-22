import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/authService.js", () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));
vi.mock("../services/recommendationService.js", () => ({
  fetchRecommendations: vi.fn(),
  primeRecommendationCache: vi.fn(),
}));
vi.mock("../services/tokenStorage.js", () => ({
  saveAccessToken: vi.fn(),
}));
vi.mock("../services/recordService.js", () => ({
  fetchRecords: vi.fn(),
}));
vi.mock("../services/venueService.js", () => ({
  fetchVenues: vi.fn(),
}));
vi.mock("../services/wishlistService.js", () => ({
  addToWishlist: vi.fn(),
  checkWishlistStatus: vi.fn(),
  listWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
}));
vi.mock("../components/passport/createRecordModal", () => ({
  CreateRecordModal: ({ isOpen, onClose, onSuccess }) =>
    isOpen ? (
      <div role="dialog">
        <button type="button" onClick={onClose}>
          Fechar modal
        </button>
        <button type="button" onClick={onSuccess}>
          Criar registro
        </button>
      </div>
    ) : null,
}));

import LandingPage from "../pages/landingPage.jsx";
import LoginPage from "../pages/loginPage.jsx";
import PassportPage from "../pages/passportPage.tsx";
import RegisterPage from "../pages/registerPage.jsx";
import { loginUser, registerUser } from "../services/authService.js";
import {
  fetchRecommendations,
  primeRecommendationCache,
} from "../services/recommendationService.js";
import { saveAccessToken } from "../services/tokenStorage.js";
import { fetchRecords } from "../services/recordService.js";
import { fetchVenues } from "../services/venueService.js";
import {
  checkWishlistStatus,
  listWishlist,
  removeFromWishlist,
} from "../services/wishlistService.js";

const venues = [
  {
    id: "venue-1",
    name: "MASP",
    category: "Museu",
    address: "Av. Paulista",
    image_url: "https://example.com/masp.jpg",
  },
];

describe("loginPage.test", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://localhost/login",
        pathname: "/login",
        search: "",
        replace: vi.fn(),
      },
    });
  });

  it("logs in, saves token, primes recommendations, and redirects to next", async () => {
    window.location.search = "?next=%2Fpassport";
    loginUser.mockResolvedValue({
      access_token: "token-1",
      user: { name: "Ada" },
    });
    primeRecommendationCache.mockResolvedValue({});

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@kulti.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: "ada@kulti.com",
        password: "password123",
      });
      expect(saveAccessToken).toHaveBeenCalledWith("token-1");
      expect(primeRecommendationCache).toHaveBeenCalled();
      expect(window.location.replace).toHaveBeenCalledWith("/passport");
    });
  });

  it("shows login errors and ignores unsafe next redirects", async () => {
    window.location.search = "?next=%2F%2Fevil.test";
    loginUser.mockRejectedValue(new Error("Credenciais inválidas"));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@kulti.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Credenciais inválidas")).toBeInTheDocument();
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
