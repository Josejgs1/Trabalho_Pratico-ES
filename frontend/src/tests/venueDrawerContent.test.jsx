import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/venueService.js", () => ({
  fetchVenueById: vi.fn(),
  fetchVenueReviews: vi.fn(),
  fetchVenues: vi.fn(),
}));
vi.mock("../services/wishlistService.js", () => ({
  addToWishlist: vi.fn(),
  checkWishlistStatus: vi.fn(),
  removeFromWishlist: vi.fn(),
}));
vi.mock("../services/recordService.js", () => ({
  createRecord: vi.fn(),
  fetchRecords: vi.fn(),
  updateRecord: vi.fn(),
}));

import { LandingShowcase } from "../components/landing/landingShowcase.jsx";
import UserDrawerContent from "../components/map/userDrawerContent.jsx";
import VenueDrawerContent from "../components/map/venueDrawerContent.jsx";
import { CreateRecordModal } from "../components/passport/createRecordModal";
import { EditRecordModal } from "../components/passport/editRecordModal";
import { RecommendationPanel } from "../components/passport/recommendationPanel.jsx";
import {
  fetchVenueById,
  fetchVenueReviews,
  fetchVenues,
} from "../services/venueService.js";
import {
  addToWishlist,
  checkWishlistStatus,
  removeFromWishlist,
} from "../services/wishlistService.js";
import {
  createRecord,
  fetchRecords,
  updateRecord,
} from "../services/recordService.js";

const venue = {
  id: "venue-1",
  name: "MASP",
  category: "Museu",
  address: "Av. Paulista",
  phone: "(11) 0000-0000",
  website: "https://masp.org.br",
  description: "Museu de arte",
  image_url: "https://example.com/masp.jpg",
};

const recommendation = {
  source: "popularity_fallback",
  itinerary_title: "Roteiro popular",
  curator_note: "Comece pelo centro",
  fallback_reason: "Sem dados suficientes para IA",
  venues: [{ ...venue, justification: "Muito visitado" }],
};

describe("venueDrawerContent.test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.spyOn(window, "open").mockImplementation(() => null);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost/passport" },
    });
  });

  it("loads venue details, copies info, switches reviews, and toggles records", async () => {
    fetchVenueById.mockResolvedValue(venue);
    fetchVenueReviews.mockResolvedValue({
      average_rating: 4.5,
      review_count: 1,
      reviews: [
        {
          id: "review-1",
          user_name: "Ada",
          rating: 5,
          comment: "",
          created_at: "2026-01-10T00:00:00Z",
        },
      ],
    });
    checkWishlistStatus.mockResolvedValue({ wishlisted: true });
    removeFromWishlist.mockResolvedValue({});
    fetchRecords.mockResolvedValue([{ id: "record-1", venue_id: "venue-1", rating: 4, comment: "Bom" }]);
    updateRecord.mockResolvedValue({});

    const onCategorySelect = vi.fn();
    render(
      <VenueDrawerContent
        venueId="venue-1"
        activeCategory="Museu"
        onCategorySelect={onCategorySelect}
      />,
    );

    expect(await screen.findByRole("heading", { name: "MASP" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Museu" }));
    expect(onCategorySelect).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByAltText("MASP"));
    expect(document.body.querySelector(".venue-lightbox")).toBeInTheDocument();
    fireEvent.click(document.body.querySelector(".venue-lightbox"));

    fireEvent.click(screen.getAllByTitle("Copiar")[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Av. Paulista");
    fireEvent.click(screen.getByText("masp.org.br"));
    expect(window.open).toHaveBeenCalledWith(
      "https://masp.org.br",
      "_blank",
      "noopener,noreferrer",
    );

    fireEvent.click(screen.getByTitle("Adicionar à wishlist"));
    expect(removeFromWishlist).toHaveBeenCalledWith("venue-1");

    fireEvent.click(screen.getByRole("button", { name: "Avaliações" }));
    expect(await screen.findByText("Média de 1 avaliação")).toBeInTheDocument();
    expect(screen.getByText("Sem comentário.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editar avaliação" }));
    expect(screen.getByRole("heading", { name: "Editar Avaliação" })).toBeInTheDocument();
  });

  it("shows venue loading, error, empty reviews, and create record flow", async () => {
    fetchVenueById.mockResolvedValue({ ...venue, image_url: "", phone: "", website: "", description: "" });
    fetchVenueReviews.mockResolvedValue({
      average_rating: null,
      review_count: 0,
      reviews: [],
    });
    checkWishlistStatus.mockRejectedValue(new Error("ignored"));
    fetchRecords.mockResolvedValue([]);
    fetchVenues.mockResolvedValue([venue]);
    createRecord.mockResolvedValue({});

    render(<VenueDrawerContent venueId="venue-1" onCategorySelect={vi.fn()} />);

    expect(screen.getByText("Carregando…")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "MASP" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Avaliações" }));
    expect(await screen.findByText("Nenhuma avaliação ainda.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Registrar visita" }));
    expect(screen.getByRole("heading", { name: "Nova Avaliação" })).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Busque um museu...")).toBeInTheDocument();
  });
});
