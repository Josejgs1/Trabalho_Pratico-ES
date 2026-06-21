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

describe("editRecordModal.test", () => {


  it("updates records from the edit modal and reports errors", async () => {
    updateRecord.mockResolvedValue({});
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    const { rerender } = render(
      <EditRecordModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        record={{ id: "record-1", rating: 3, comment: "Bom" }}
      />,
    );

    fireEvent.click(screen.getAllByText("", { selector: ".star" })[4]);
    fireEvent.change(screen.getByPlaceholderText("Conte sua opinião..."), {
      target: { value: "Excelente" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith("record-1", {
        rating: 5,
        comment: "Excelente",
      });
      expect(onClose).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    updateRecord.mockRejectedValue(new Error("Falha ao atualizar"));
    rerender(
      <EditRecordModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        record={{ id: "record-2", rating: 2, comment: null }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    expect(await screen.findByText("Falha ao atualizar")).toBeInTheDocument();
  });
});
