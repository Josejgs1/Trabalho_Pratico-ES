import { MagnifyingGlass, Faders } from "@phosphor-icons/react";
import "../../styles/mapOverlay.css";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar-wrapper">
      <MagnifyingGlass size={16} weight="regular" className="search-bar-icon" />
      <input
        className="search-bar-input"
        type="text"
        placeholder="Busque por museus, galerias..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="search-bar-filter" aria-label="Filtros">
        <Faders size={16} weight="regular" />
      </button>
    </div>
  );
}
