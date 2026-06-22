import React, { forwardRef, useImperativeHandle } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-map-gl/mapbox", () => {
  const Map = forwardRef(({ children, onClick }, ref) => {
    useImperativeHandle(ref, () => ({
      easeTo: vi.fn(),
      getCenter: () => ({ lng: -43.9, lat: -19.9 }),
      getZoom: () => 12,
      project: () => ({ x: 0, y: 0 }),
    }));

    return (
      <div data-testid="map" onClick={onClick}>
        {children}
      </div>
    );
  });

  return {
    default: Map,
    Marker: ({ children }) => <div>{children}</div>,
    NavigationControl: () => <span data-testid="nav-control" />,
    Popup: ({ children }) => <div role="tooltip">{children}</div>,
  };
});

vi.mock("../services/authService.js", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("../services/tokenStorage.js", () => ({
  clearAccessToken: vi.fn(),
}));
vi.mock("../services/venueService.js", () => ({
  fetchVenues: vi.fn(),
}));
vi.mock("../components/map/venueDrawerContent.jsx", () => ({
  default: ({ venueId, onCategorySelect, activeCategory }) => (
    <div>
      Venue drawer {venueId}
      <button type="button" onClick={() => onCategorySelect(activeCategory ? null : "Museu")}>
        Toggle drawer category
      </button>
    </div>
  ),
}));

import MapPage from "../pages/mapPage.jsx";
import { getCurrentUser } from "../services/authService.js";
import { clearAccessToken } from "../services/tokenStorage.js";
import { fetchVenues } from "../services/venueService.js";

const venues = [
  {
    id: "venue-1",
    name: "MASP",
    category: "Museu",
    address: "Av. Paulista",
    latitude: -19.9,
    longitude: -43.9,
  },
  {
    id: "venue-2",
    name: "Pinacoteca",
    category: "Galeria",
    address: "Luz",
    latitude: -19.91,
    longitude: -43.91,
  },
];

describe("MapPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://localhost/map",
        pathname: "/map",
        search: "",
      },
    });
    fetchVenues.mockResolvedValue(venues);
    getCurrentUser.mockResolvedValue({
      name: "Ada",
      email: "ada@kulti.com",
      created_at: "2026-01-10T00:00:00Z",
      is_active: true,
    });
  });

  it("loads venues, filters search results, opens drawers, and signs out", async () => {
    render(<MapPage />);

    expect(await screen.findByLabelText("MASP")).toBeInTheDocument();
    expect(screen.getByLabelText("Pinacoteca")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Busque por museus, galerias..."), {
      target: { value: "ma" },
    });
    expect(screen.getByRole("option", { name: /MASP/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /MASP/ }));
    expect(await screen.findByText(/Venue drawer venue-1/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Toggle drawer category"));

    fireEvent.click(screen.getByRole("button", { name: "Museu" }));
    await waitFor(() => {
      expect(fetchVenues).toHaveBeenCalledWith(
        expect.objectContaining({ category: "Museu" }),
      );
    });

    fireEvent.mouseEnter(screen.getByLabelText("MASP"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("MASP");
    fireEvent.mouseLeave(screen.getByLabelText("MASP"));

    fireEvent.click(screen.getByLabelText("Abrir perfil"));
    expect(await screen.findByText("Ada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(clearAccessToken).toHaveBeenCalled();
    expect(window.location.href).toBe("/");
  });

  it("loads an initial venue from the query string and handles fetch errors", async () => {
    window.location.search = "?venue=venue-2";
    fetchVenues.mockResolvedValueOnce(venues).mockResolvedValueOnce(venues).mockRejectedValueOnce(
      new Error("offline"),
    );

    render(<MapPage />);

    await screen.findByLabelText("Pinacoteca");

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("shows profile loading errors and closes drawers from map clicks", async () => {
    getCurrentUser.mockRejectedValue(new Error("Falha no perfil"));

    render(<MapPage />);

    await screen.findByLabelText("MASP");
    fireEvent.click(screen.getByRole("button", { name: /Meu Passaporte/ }));
    expect(window.location.href).toBe("/passport");

    fireEvent.click(screen.getByLabelText("Abrir perfil"));

    expect(await screen.findByText("Falha no perfil")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("map"));
    expect(screen.getByLabelText("Perfil do usuário")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
