import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CategoryCarousel from "../components/map/categoryCarousel.jsx";
import MapOverlay from "../components/map/mapOverlay.jsx";
import SearchBar from "../components/map/searchBar.jsx";
import SearchResults from "../components/map/searchResults.jsx";
import SideDrawer from "../components/map/sideDrawer.jsx";

const venues = [
  { id: "1", name: "MASP", category: "Museu", address: "Av. Paulista" },
  { id: "2", name: "Pinacoteca", category: "Galeria", address: "Luz" },
];

describe("map components", () => {
  it("renders and selects search results only when visible", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <SearchResults items={venues} onSelect={onSelect} visible={false} />,
    );

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    rerender(<SearchResults items={venues} onSelect={onSelect} visible={true} />);
    fireEvent.click(screen.getByRole("option", { name: /MASP/ }));

    expect(onSelect).toHaveBeenCalledWith(venues[0]);
  });

  it("limits rendered search results", () => {
    const manyVenues = Array.from({ length: 7 }, (_, index) => ({
      id: String(index),
      name: `Venue ${index}`,
      category: "Museu",
      address: "Centro",
    }));

    render(<SearchResults items={manyVenues} onSelect={vi.fn()} visible={true} />);

    expect(screen.getAllByRole("option")).toHaveLength(6);
  });

  it("updates the search value from the input", () => {
    const onChange = vi.fn();
    render(
      <SearchBar
        value=""
        onChange={onChange}
        onResultSelect={vi.fn()}
        results={[]}
        showResults={false}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Busque por museus, galerias..."), {
      target: { value: "MASP" },
    });

    expect(onChange).toHaveBeenCalledWith("MASP");
  });

  it("toggles category selection", () => {
    const onSelect = vi.fn();
    render(
      <CategoryCarousel
        categories={["Museu", "Galeria"]}
        active="Museu"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Museu" }));
    fireEvent.click(screen.getByRole("button", { name: "Galeria" }));

    expect(onSelect).toHaveBeenNthCalledWith(1, null);
    expect(onSelect).toHaveBeenNthCalledWith(2, "Galeria");
  });

  it("marks side drawer as open when requested", () => {
    render(<SideDrawer open={true}>Detalhes</SideDrawer>);

    expect(screen.getByText("Detalhes")).toHaveClass("side-drawer--open");
  });

  it("composes search, category, and drawer controls", () => {
    const onSearchChange = vi.fn();
    const onCategorySelect = vi.fn();
    const onSearchResultSelect = vi.fn();

    render(
      <MapOverlay
        search=""
        onSearchChange={onSearchChange}
        searchResults={venues}
        showSearchResults={true}
        onSearchResultSelect={onSearchResultSelect}
        categories={["Museu"]}
        activeCategory={null}
        onCategorySelect={onCategorySelect}
        drawerOpen={true}
      >
        Painel aberto
      </MapOverlay>,
    );

    fireEvent.change(screen.getByPlaceholderText("Busque por museus, galerias..."), {
      target: { value: "pina" },
    });
    fireEvent.click(screen.getByRole("option", { name: /Pinacoteca/ }));
    fireEvent.click(screen.getByRole("button", { name: "Museu" }));

    expect(onSearchChange).toHaveBeenCalledWith("pina");
    expect(onSearchResultSelect).toHaveBeenCalledWith(venues[1]);
    expect(onCategorySelect).toHaveBeenCalledWith("Museu");
    expect(screen.getByText("Painel aberto")).toBeInTheDocument();
  });
});
