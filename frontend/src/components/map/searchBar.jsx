import { MagnifyingGlass } from "@phosphor-icons/react";
import SearchResults from "./searchResults.jsx";
import "../../styles/mapOverlay.css";

export default function SearchBar({
  value,
  onChange,
  onResultSelect,
  results,
  showResults,
}) {
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
      </div>
      <SearchResults
        items={results}
        onSelect={onResultSelect}
        visible={showResults}
      />
    </div>
  );
}
