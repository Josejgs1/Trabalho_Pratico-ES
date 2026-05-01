import { MagnifyingGlass, Faders } from "@phosphor-icons/react";
import SearchResults from "./searchResults.jsx";
import "../../styles/mapOverlay.css";

export default function SearchBar({
  value,
  onChange,
  filterActive,
  onFilterClick,
  onResultSelect,
  results,
  showResults,
}) {
  const label = filterActive
    ? "Remover filtro por área"
    : "Filtrar por área do mapa";

  return (
    <div className="search-control">
      <div className="search-bar-wrapper">
        <MagnifyingGlass
          size={16}
          weight="regular"
          className="search-bar-icon"
        />
        <input
          className="search-bar-input"
          type="text"
          placeholder="Busque por museus, galerias..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className={`search-bar-filter${
            filterActive ? " search-bar-filter--active" : ""
          }`}
          aria-label={label}
          onClick={onFilterClick}
          title={label}
          type="button"
        >
          <Faders size={16} weight="regular" />
        </button>
      </div>
      <SearchResults
        items={results}
        onSelect={onResultSelect}
        visible={showResults}
      />
    </div>
  );
}
