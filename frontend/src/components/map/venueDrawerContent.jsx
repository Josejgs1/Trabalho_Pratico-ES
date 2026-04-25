import { useEffect, useState } from "react";
import { fetchVenueById } from "../../services/venueService.js";

export default function VenueDrawerContent({ venueId }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!venueId) return;
    setLoading(true);
    setError("");
    fetchVenueById(venueId)
      .then(setVenue)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [venueId]);

  if (loading) return <p className="drawer-status">Carregando…</p>;
  if (error) return <p className="drawer-status drawer-error">{error}</p>;
  if (!venue) return null;

  return (
    <div className="venue-detail">
      {venue.image_url && (
        <img src={venue.image_url} alt={venue.name} className="venue-detail-image" />
      )}
      <span className="venue-detail-category">{venue.category}</span>
      <h2 className="venue-detail-title">{venue.name}</h2>
      {venue.description && <p className="venue-detail-desc">{venue.description}</p>}
      <address className="venue-detail-address">{venue.address}</address>
      {venue.phone && (
        <p className="venue-detail-meta">
          <a href={`tel:${venue.phone}`}>{venue.phone}</a>
        </p>
      )}
      {venue.website && (
        <p className="venue-detail-meta">
          <a href={venue.website} target="_blank" rel="noopener noreferrer">
            Visitar site
          </a>
        </p>
      )}
    </div>
  );
}
