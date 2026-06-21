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

describe("pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/login",
        search: "",
        replace: vi.fn(),
      },
    });
  });

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
