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

describe("landingPage.test", () => {


  it("renders LandingPage and rotates showcase layout", () => {
    vi.useFakeTimers();
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "KULTI" })).toBeInTheDocument();
    expect(screen.getByLabelText("Navegação pública")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4200);
    });
    expect(screen.getByLabelText("Prévias da KULTI")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
