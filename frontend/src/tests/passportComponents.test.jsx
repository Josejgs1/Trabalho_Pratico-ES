import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PassportHeader } from "../components/passport/passportHeader.jsx";
import { RecordCard } from "../components/passport/recordCard.jsx";
import { RecordList } from "../components/passport/recordList.jsx";
import { WishlistCard } from "../components/passport/wishlistCard.jsx";
import { WishlistList } from "../components/passport/wishlistList.jsx";

vi.mock("../components/passport/editRecordModal", () => ({
  EditRecordModal: ({ isOpen, onClose, onSuccess }) =>
    isOpen ? (
      <div role="dialog">
        <button onClick={onClose} type="button">
          Fechar
        </button>
        <button onClick={onSuccess} type="button">
          Salvar edição
        </button>
      </div>
    ) : null,
}));

vi.mock("../services/wishlistService.js", () => ({
  removeFromWishlist: vi.fn(),
}));

import { removeFromWishlist } from "../services/wishlistService.js";

const venue = {
  id: "venue-1",
  name: "MASP",
  category: "Museu",
  address: "Av. Paulista",
  image_url: "https://example.com/masp.jpg",
};

const record = {
  id: "record-1",
  venue_id: "venue-1",
  rating: 5,
  comment: "Visita excelente",
};

describe("passport components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost/passport" },
    });
  });

  it("renders the passport header", () => {
    render(<PassportHeader />);

    expect(
      screen.getByRole("heading", { name: "Passaporte Digital" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Um registro da sua jornada cultural")).toBeInTheDocument();
  });

  it("renders an empty record list message", () => {
    render(<RecordList records={[]} venues={[venue]} onUpdated={vi.fn()} />);

    expect(screen.getByText("Você ainda não visitou nenhum museu.")).toBeInTheDocument();
  });

  it("renders record cards with venue details", () => {
    render(<RecordList records={[record]} venues={[venue]} onUpdated={vi.fn()} />);

    expect(screen.getByText("MASP")).toBeInTheDocument();
    expect(screen.getByText("Visita excelente")).toBeInTheDocument();
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
  });

  it("opens the edit modal without navigating and calls update callback", () => {
    const onUpdated = vi.fn();
    render(<RecordCard record={record} venue={venue} onUpdated={onUpdated} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar edição" }));

    expect(onUpdated).toHaveBeenCalled();
    expect(window.location.href).toBe("http://localhost/passport");
  });

  it("navigates record cards to the matching venue", () => {
    render(<RecordCard record={record} venue={venue} onUpdated={vi.fn()} />);

    fireEvent.click(screen.getByText("MASP"));

    expect(window.location.href).toBe("/map?venue=venue-1");
  });

  it("renders fallback record content for unknown venues", () => {
    render(<RecordCard record={{ ...record, comment: "" }} venue={undefined} />);

    expect(screen.getByText("Local desconhecido")).toBeInTheDocument();
    expect(screen.getByAltText("Imagem do local")).toBeInTheDocument();
  });

  it("renders an empty wishlist message", () => {
    render(<WishlistList wishlist={[]} venues={[venue]} onRemoved={vi.fn()} />);

    expect(
      screen.getByText("Você ainda não adicionou nenhum local à sua lista de desejos."),
    ).toBeInTheDocument();
  });

  it("renders wishlist cards and removes items", async () => {
    const onRemoved = vi.fn();
    removeFromWishlist.mockResolvedValue({});

    render(
      <WishlistList
        wishlist={[{ id: "wish-1", venue_id: "venue-1" }]}
        venues={[venue]}
        onRemoved={onRemoved}
      />,
    );

    expect(screen.getByText("MASP")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Remover da lista"));

    await waitFor(() => {
      expect(removeFromWishlist).toHaveBeenCalledWith("venue-1");
      expect(onRemoved).toHaveBeenCalled();
    });
  });

  it("navigates wishlist cards to the matching venue", () => {
    render(
      <WishlistCard
        item={{ id: "wish-1", venue_id: "venue-1" }}
        venue={venue}
        onRemoved={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("MASP"));

    expect(window.location.href).toBe("/map?venue=venue-1");
  });

  it("renders fallback wishlist content for unknown venues", () => {
    render(
      <WishlistCard
        item={{ id: "wish-1", venue_id: "venue-1" }}
        venue={undefined}
        onRemoved={vi.fn()}
      />,
    );

    expect(screen.getByText("Local desconhecido")).toBeInTheDocument();
    expect(screen.getByAltText("Venue image")).toBeInTheDocument();
  });
});
