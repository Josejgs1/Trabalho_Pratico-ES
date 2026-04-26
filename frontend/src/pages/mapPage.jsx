import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { Stamp, User } from "@phosphor-icons/react";
import MapOverlay from "../components/map/mapOverlay.jsx";
import VenueDrawerContent from "../components/map/venueDrawerContent.jsx";
import { KultiLogo } from "../components/brand/kultiLogo.jsx";
import { fetchVenues } from "../services/venueService.js";
import "../styles/mapPage.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Belo Horizonte center
const INITIAL_VIEW = { longitude: -43.9378, latitude: -19.9191, zoom: 12 };

const MAX_BOUNDS = [
  [-44.3, -20.1],  // southwest
  [-43.8, -19.8],  // northeast
];

// Drawer width (33.33vw) + left margin (1rem) + gap
const drawerPadding = () => window.innerWidth * 0.3333 + 32;

export default function MapPage() {
  const mapRef = useRef(null);
  const [venues, setVenues] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  useEffect(() => {
    fetchVenues()
      .then(setVenues)
      .catch((err) => console.error("Failed to load venues:", err));
  }, []);

  const categories = useMemo(
    () => [...new Set(venues.map((v) => v.category))].sort(),
    [venues],
  );

  const filtered = useMemo(() => {
    let result = venues;
    if (activeCategory) result = result.filter((v) => v.category === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((v) => v.name.toLowerCase().includes(q));
    }
    return result;
  }, [venues, activeCategory, search]);

  const openDrawer = useCallback((venue) => {
    setDrawerOpen(true);
    setSelectedVenueId(venue.id);
    const map = mapRef.current;
    if (!map) return;
    const px = map.project([venue.longitude, venue.latitude]);
    if (px.x < drawerPadding()) {
      map.easeTo({
        center: [venue.longitude, venue.latitude],
        padding: { left: drawerPadding(), top: 0, right: 0, bottom: 0 },
        duration: 400,
      });
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedVenueId(null);
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    map.easeTo({ center, padding: { left: 0, top: 0, right: 0, bottom: 0 }, duration: 400 });
  }, []);

  return (
    <div className="map-wrapper">
      <div className="map-logo">
        <KultiLogo className="map-logo-icon" />
        <span>KULTI</span>
      </div>
      <div className="map-top-right">
        <button className="passport-button">
          <Stamp size={18} weight="regular" />
          Meu Passaporte
        </button>
        <button className="profile-button">
          <User size={18} weight="regular" />
        </button>
      </div>
      <MapOverlay
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        drawerOpen={drawerOpen}
      >
        {selectedVenueId && <VenueDrawerContent venueId={selectedVenueId} onCategorySelect={setActiveCategory} activeCategory={activeCategory} />}
      </MapOverlay>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW}
        mapStyle="mapbox://styles/mapbox/light-v11"
        maxBounds={MAX_BOUNDS}
        style={{ width: "100%", height: "100vh" }}
        onClick={closeDrawer}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <NavigationControl position="bottom-right" showZoom={false} visualizePitch />
        {filtered.map((venue) => (
          <Marker
            key={venue.id}
            longitude={venue.longitude}
            latitude={venue.latitude}
            anchor="center"
          >
            <span
              className="venue-marker"
              aria-label={venue.name}
              onMouseEnter={() => setHovered(venue)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                openDrawer(venue);
              }}
            />
          </Marker>
        ))}

        {hovered && (
          <Popup
            longitude={hovered.longitude}
            latitude={hovered.latitude}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            className="venue-popup"
          >
            <h3 className="venue-popup-name">{hovered.name}</h3>
            <p className="venue-popup-category">{hovered.category}</p>
            <p className="venue-popup-address">{hovered.address}</p>
          </Popup>
        )}
      </Map>
    </div>
  );
}
