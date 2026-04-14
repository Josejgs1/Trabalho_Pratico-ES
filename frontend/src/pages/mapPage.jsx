import { useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { fetchVenues } from "../services/venueService.js";
import "../styles/mapPage.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Belo Horizonte center
const INITIAL_VIEW = { longitude: -43.9378, latitude: -19.9191, zoom: 12 };

export default function MapPage() {
  const [venues, setVenues] = useState([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    fetchVenues()
      .then(setVenues)
      .catch((err) => console.error("Failed to load venues:", err));
  }, []);

  return (
    <div className="map-wrapper">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100vh" }}
      >
        {venues.map((venue) => (
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
