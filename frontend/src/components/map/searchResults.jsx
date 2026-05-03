import "../../styles/mapOverlay.css";

const MAX_RESULTS = 6;

export default function SearchResults({ items, onSelect, visible }) {
  if (!visible || items.length === 0) return null;

  return (
    <div className="search-results" role="listbox">
      {items.slice(0, MAX_RESULTS).map((venue) => (
        <button
          className="search-result-item"
          key={venue.id}
          onClick={() => onSelect(venue)}
          role="option"
          type="button"
        >
          <span className="search-result-name">{venue.name}</span>
          <span className="search-result-meta">
            {venue.category} - {venue.address}
          </span>
        </button>
      ))}
    </div>
  );
}
