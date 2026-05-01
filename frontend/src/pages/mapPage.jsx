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
  [-44.23, -20.14],
  [-43.90, -19.84],
];

const NEARBY_RADIUS_METERS = 3000;

// Drawer width (33.33vw) + left margin (1rem) + gap
const drawerPadding = () => window.innerWidth * 0.3333 + 32;

function buildVenueParams({ search, category, nearby }) {
  const params = {};
  const query = search.trim();

  if (query) params.search = query;
  if (category) params.category = category;

  if (nearby) {
    params.latitude = nearby.latitude;
    params.longitude = nearby.longitude;
    params.radiusMeters = nearby.radiusMeters;
  }

  return params;
}

function toNearbyFilter(center) {
  const latitude = center.lat ?? center.latitude;
  const longitude = center.lng ?? center.longitude;

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    radiusMeters: NEARBY_RADIUS_METERS,
  };
}

export default function MapPage() {
  const mapRef = useRef(null);
  const autoOpenedSearchRef = useRef("");
  const loadedVenueParamsKeyRef = useRef("");
  const requestIdRef = useRef(0);

  const [venues, setVenues] = useState([]);
  const [allVenues, setAllVenues] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [nearbyFilter, setNearbyFilter] = useState(null);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  const [initialVenueId, setInitialVenueId] = useState(null);

  const venueParams = useMemo(
    () => buildVenueParams({
      search: debouncedSearch,
      category: activeCategory,
      nearby: nearbyFilter,
    }),
    [activeCategory, debouncedSearch, nearbyFilter],
  );

  const venueParamsKey = useMemo(
    () => JSON.stringify(venueParams),
    [venueParams],
  );

  const openDrawer = useCallback((venue, options = {}) => {
    setDrawerOpen(true);
    setSelectedVenueId(venue.id);

    const map = mapRef.current;
    if (!map) return;

    const padding = drawerPadding();
    const center = [venue.longitude, venue.latitude];

    if (options.focus) {
      map.easeTo({
        center,
        padding: { left: padding, top: 0, right: 0, bottom: 0 },
        zoom: Math.max(map.getZoom(), 14),
        duration: 500,
      });
      return;
    }

    const px = map.project([venue.longitude, venue.latitude]);

    if (px.x < padding) {
      map.easeTo({
        center,
        padding: { left: padding, top: 0, right: 0, bottom: 0 },
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
    map.easeTo({
      center,
      padding: { left: 0, top: 0, right: 0, bottom: 0 },
      duration: 400,
    });
  }, []);

  return (
    <div className="map-wrapper">
      <div className="map-logo">
        <KultiLogo className="map-logo-icon" />
        <span>KULTI</span>
      </div>

      <div className="map-top-right">
        <button
          className="passport-button"
          onClick={() => (window.location.href = "/passport")}
        >
          <Stamp size={18} weight="regular" />
          Meu Passaporte
        </button>

        <button className="profile-button">
          <User size={18} weight="regular" />
        </button>
      </div>

      <MapOverlay
        nearbyActive={Boolean(nearbyFilter)}
        onNearbyToggle={handleNearbyToggle}
        search={search}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onSearchResultSelect={handleSearchResultSelect}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        drawerOpen={drawerOpen}
      >
        {selectedVenueId && (
          <VenueDrawerContent
            venueId={selectedVenueId}
            onCategorySelect={setActiveCategory}
            activeCategory={activeCategory}
          />
        )}
      </MapOverlay>

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW}
        mapStyle="mapbox://styles/kauantp/cmof2thkt003u01qpfwrb1v0i"
        maxBounds={MAX_BOUNDS}
        style={{ width: "100%", height: "100vh" }}
        onClick={closeDrawer}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <NavigationControl
          position="bottom-right"
          showZoom={false}
          visualizePitch
        />

        {venues.map((venue) => (
          <Marker
            key={venue.id}
            longitude={venue.longitude}
            latitude={venue.latitude}
            anchor="center"
            style={{ zIndex: selectedVenueId === venue.id ? 2 : 1 }}
          >
            <span
              className={`venue-marker${
                selectedVenueId === venue.id ? " venue-marker--selected" : ""
              }`}
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
