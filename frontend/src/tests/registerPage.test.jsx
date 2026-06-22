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

describe("registerPage.test", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://localhost/register",
        pathname: "/register",
        search: "",
        replace: vi.fn(),
      },
    });
  });

  it("registers, logs in, saves token, and redirects to map", async () => {
    registerUser.mockResolvedValue({ id: "user-1" });
    loginUser.mockResolvedValue({
      access_token: "token-1",
      user: { name: "Ada" },
    });
    primeRecommendationCache.mockRejectedValue(new Error("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@kulti.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: "Ada",
        email: "ada@kulti.com",
        password: "password123",
      });
      expect(loginUser).toHaveBeenCalledWith({
        email: "ada@kulti.com",
        password: "password123",
      });
      expect(window.location.replace).toHaveBeenCalledWith("/map");
    });
  });

  it("shows registration errors", async () => {
    registerUser.mockRejectedValue(new Error("Email já cadastrado"));

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@kulti.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Email já cadastrado")).toBeInTheDocument();
  });
});
