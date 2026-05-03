import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { Stamp, User } from "@phosphor-icons/react";
import MapOverlay from "../components/map/mapOverlay.jsx";
import UserDrawerContent from "../components/map/userDrawerContent.jsx";
import VenueDrawerContent from "../components/map/venueDrawerContent.jsx";
import { KultiLogo } from "../components/brand/kultiLogo.jsx";
import { getCurrentUser } from "../services/authService.js";
import { clearAccessToken } from "../services/tokenStorage.js";
import { fetchVenues } from "../services/venueService.js";
import "../styles/mapPage.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Belo Horizonte center
const INITIAL_VIEW = { longitude: -43.9378, latitude: -19.9191, zoom: 12 };

const MAX_BOUNDS = [
  [-44.30, -20.14],
  [-43.72, -19.84],
];

// Drawer width (33.33vw) + left margin (1rem) + gap
const drawerPadding = () => window.innerWidth * 0.3333 + 32;

function buildVenueParams({ search, category }) {
  const params = {};
  const query = search.trim();

  if (query) params.search = query;
  if (category) params.category = category;

  return params;
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
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [initialVenueId, setInitialVenueId] = useState(null);

  const venueParams = useMemo(
    () => buildVenueParams({
      search: debouncedSearch,
      category: activeCategory,
    }),
    [activeCategory, debouncedSearch],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const venueId = params.get("venue");

    if (venueId) {
      setInitialVenueId(venueId);
    }
  }, []);

  useEffect(() => {
    fetchVenues()
      .then(setVenues)
      .catch((err) => console.error("Failed to load venues:", err));
  }, []);

  const loadCurrentUser = useCallback(() => {
    setProfileLoading(true);
    setProfileError("");

    getCurrentUser()
      .then(setCurrentUser)
      .catch((err) => setProfileError(err.message))
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    if (!initialVenueId || venues.length === 0) return;

    const venue = venues.find((v) => v.id === initialVenueId);

    if (venue) {
      setTimeout(() => {
        openDrawer(venue);
      }, 200);
    }
  }, [initialVenueId, venues]);

  const categories = useMemo(
    () => [...new Set(venues.map((v) => v.category))].sort(),
    [venues],
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const venueId = params.get("venue");

    if (venueId) {
      setInitialVenueId(venueId);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ignored = false;

    fetchVenues()
      .then((data) => {
        if (!ignored) setAllVenues(data);
      })
      .catch((err) => {
        console.error("Failed to load venue categories:", err);
      });

    return () => {
      ignored = true;
    };
  }, []);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoadingVenues(true);

    fetchVenues(venueParams)
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        loadedVenueParamsKeyRef.current = venueParamsKey;
        setVenues(data);
        if (data.length <= 1) setSearchResultsOpen(false);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setVenues([]);
        console.error("Failed to load venues:", err);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoadingVenues(false);
      });
  }, [venueParams, venueParamsKey]);

  useEffect(() => {
    if (!initialVenueId || venues.length === 0) return undefined;

    const venue = venues.find((v) => v.id === initialVenueId);
    if (!venue) return undefined;

    const timer = window.setTimeout(() => {
      openDrawer(venue);
      setInitialVenueId(null);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [initialVenueId, openDrawer, venues]);

  useEffect(() => {
    if (!hovered) return;
    if (!venues.some((venue) => venue.id === hovered.id)) setHovered(null);
  }, [hovered, venues]);

  useEffect(() => {
    if (!selectedVenueId || loadingVenues) return;
    if (venues.some((venue) => venue.id === selectedVenueId)) return;
    closeDrawer();
  }, [closeDrawer, loadingVenues, selectedVenueId, venues]);

  useEffect(() => {
    const query = debouncedSearch.trim();
    if (loadingVenues || query.length < 3 || venues.length !== 1) return;
    if (loadedVenueParamsKeyRef.current !== venueParamsKey) return;

    const venue = venues[0];
    const searchKey = `${query.toLowerCase()}::${venue.id}`;
    if (autoOpenedSearchRef.current === searchKey) return;

    autoOpenedSearchRef.current = searchKey;
    setSearchResultsOpen(false);
    openDrawer(venue, { focus: true });
  }, [
    debouncedSearch,
    loadingVenues,
    openDrawer,
    venueParamsKey,
    venues,
  ]);

  const searchResults = useMemo(() => {
    if (search.trim().length < 2) return [];
    return venues;
  }, [search, venues]);

  const showSearchResults = Boolean(
    searchResultsOpen && searchResults.length > 1,
  );

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setSearchResultsOpen(true);
  }, []);

  const handleSearchResultSelect = useCallback((venue) => {
    setSearch(venue.name);
    setDebouncedSearch(venue.name);
    setSearchResultsOpen(false);
    openDrawer(venue, { focus: true });
  }, [openDrawer]);

  const handleProfileClick = useCallback(() => {
    setProfileDrawerOpen((isOpen) => !isOpen);

    if (!currentUser && !profileLoading) {
      loadCurrentUser();
    }
  }, [currentUser, loadCurrentUser, profileLoading]);

  const closeProfileDrawer = useCallback(() => {
    setProfileDrawerOpen(false);
  }, []);

  const handleMapClick = useCallback(() => {
    closeDrawer();
    closeProfileDrawer();
  }, [closeDrawer, closeProfileDrawer]);

  const handleSignOut = useCallback(() => {
    clearAccessToken();
    window.location.href = "/";
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

        <button
          className={`profile-button${
            profileDrawerOpen ? " profile-button--active" : ""
          }`}
          aria-label="Abrir perfil"
          aria-expanded={profileDrawerOpen}
          onClick={handleProfileClick}
          title="Perfil"
        >
          <User size={18} weight="regular" />
        </button>
      </div>

      <UserDrawerContent
        open={profileDrawerOpen}
        user={currentUser}
        loading={profileLoading}
        error={profileError}
        onClose={closeProfileDrawer}
        onSignOut={handleSignOut}
      />

      <MapOverlay
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
        onClick={handleMapClick}
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
