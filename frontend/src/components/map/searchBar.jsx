import "../../styles/mapOverlay.css";

export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Busque por museus, galerias..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
