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

describe("passportPage.test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://localhost/passport",
        pathname: "/passport",
        search: "",
        replace: vi.fn(() => {
          Object.defineProperty(window, "location", {
            value: { ...window.location, pathname: "/map" },
          });
        }),
      },
    });
  });

  it("loads passport data, switches tabs, opens modal, and navigates back", async () => {
    fetchRecords.mockResolvedValue([
      { id: "record-1", venue_id: "venue-1", rating: 5, comment: "Ótimo" },
    ]);
    fetchVenues.mockResolvedValue(venues);
    listWishlist.mockResolvedValue([{ id: "wish-1", venue_id: "venue-1" }]);
    removeFromWishlist.mockResolvedValue({});
    checkWishlistStatus.mockResolvedValue({ wishlisted: false });
    fetchRecommendations.mockResolvedValue({
      source: "ai",
      itinerary_title: "Roteiro de sábado",
      curator_note: "Comece pelo MASP",
      venues: venues.map((venue) => ({ ...venue, justification: "Clássico" })),
    });

    render(<PassportPage />);

    expect(screen.getByText("Loading your journey...")).toBeInTheDocument();
    expect(await screen.findByText("Ótimo")).toBeInTheDocument();
    expect(screen.getByText("Roteiro de sábado")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Quero visitar" }));
    expect(screen.getAllByText("Av. Paulista").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Nova Avaliação/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Criar registro" }));
    expect(fetchRecords).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(window.location.pathname).toBe("/map");
  });

  it("shows passport loading errors and recommendation errors", async () => {
    fetchRecords.mockRejectedValue(new Error("offline"));
    fetchVenues.mockResolvedValue([]);
    listWishlist.mockResolvedValue([]);
    checkWishlistStatus.mockResolvedValue({ wishlisted: false });
    fetchRecommendations.mockRejectedValue(new Error("no route"));

    render(<PassportPage />);

    expect(
      await screen.findByText("Falha ao carregar seu passaporte"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Não foi possível carregar seu roteiro agora."),
    ).toBeInTheDocument();
  });
});
