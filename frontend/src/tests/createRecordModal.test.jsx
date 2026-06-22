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

describe("createRecordModal.test", () => {


  it("creates records from the modal", async () => {
    fetchVenues.mockResolvedValue([venue]);
    createRecord.mockResolvedValue({ id: "record-1" });
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <CreateRecordModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Busque um museu..."), {
      target: { value: "MA" },
    });
    expect(await screen.findByText("MASP")).toBeInTheDocument();
    fireEvent.click(screen.getByText("MASP"));
    fireEvent.click(screen.getAllByText("", { selector: ".star" })[4]);
    fireEvent.change(screen.getByPlaceholderText("Conte sua opinião..."), {
      target: { value: "Excelente" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => {
      expect(createRecord).toHaveBeenCalledWith({
        venue_id: "venue-1",
        rating: 5,
        comment: "Excelente",
      });
      expect(onClose).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows create modal errors and respects initial venue", async () => {
    fetchVenues.mockResolvedValue([venue]);
    createRecord.mockRejectedValue(new Error("Não foi possível criar"));

    render(
      <CreateRecordModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        initialVenueId="venue-1"
      />,
    );

    expect(await screen.findByText("Selecionado")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText("", { selector: ".star" })[2]);
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Não foi possível criar")).toBeInTheDocument();
  });
});
