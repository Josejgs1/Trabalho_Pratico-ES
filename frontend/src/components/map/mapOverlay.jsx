import SearchBar from "./searchBar.jsx";
import CategoryCarousel from "./categoryCarousel.jsx";
import SideDrawer from "./sideDrawer.jsx";
import "../../styles/mapOverlay.css";

export default function MapOverlay({
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategorySelect,
  drawerOpen,
  children,
}) {
  return (
    <div className="map-overlay">
      <SearchBar value={search} onChange={onSearchChange} />
      <CategoryCarousel
        categories={categories}
        active={activeCategory}
        onSelect={onCategorySelect}
      />
      <SideDrawer open={drawerOpen}>{children}</SideDrawer>
    </div>
  );
}
