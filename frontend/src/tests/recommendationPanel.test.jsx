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

describe("recommendationPanel.test", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://localhost/",
        pathname: "/",
        search: "",
        replace: vi.fn(),
      },
    });
  });

  it("renders recommendation states and toggles wishlist", async () => {
    checkWishlistStatus.mockResolvedValue({ wishlisted: false });
    addToWishlist.mockResolvedValue({});

    const { rerender } = render(
      <RecommendationPanel loading={true} error="" recommendation={null} />,
    );
    expect(screen.getByText("Preparando recomendações...")).toBeInTheDocument();

    rerender(<RecommendationPanel loading={false} error="Falha" recommendation={null} />);
    expect(screen.getByText("Roteiro indisponível")).toBeInTheDocument();

    rerender(<RecommendationPanel loading={false} error="" recommendation={{ venues: [] }} />);
    expect(
      screen.getByText("Ainda não há recomendações disponíveis"),
    ).toBeInTheDocument();

    rerender(
      <RecommendationPanel
        loading={false}
        error=""
        recommendation={recommendation}
      />,
    );

    expect(await screen.findByText("Roteiro popular")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Adicionar à wishlist"));
    expect(addToWishlist).toHaveBeenCalledWith("venue-1");

    const recommendationCard = screen.getByRole("button", { name: /MASP/ });
    fireEvent.keyDown(recommendationCard, { key: "Enter" });
    expect(window.location.href).toBe("/map?venue=venue-1");

    window.location.href = "http://localhost/passport";
    fireEvent.keyDown(recommendationCard, { key: " " });
    expect(window.location.href).toBe("/map?venue=venue-1");
  });
});
