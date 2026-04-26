import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Phone, Globe, Copy, ArrowSquareOut } from "@phosphor-icons/react";
import { fetchVenueById } from "../../services/venueService.js";

function InfoRow({ icon, text, href, onCopy }) {
  const handleRowClick = (e) => {
    if (e.target.closest(".venue-info-action")) return;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    else if (onCopy) onCopy();
  };

  return (
    <div className="venue-info-row" onClick={handleRowClick}>
      <span className="venue-info-icon">{icon}</span>
      <span className="venue-info-text">{text}</span>
      <span className="venue-info-actions">
        {onCopy && (
          <button className="venue-info-action" onClick={(e) => { e.stopPropagation(); onCopy(); }} title="Copiar">
            <Copy size={15} />
          </button>
        )}
        {href && (
          <a className="venue-info-action" href={href} target="_blank" rel="noopener noreferrer" title="Abrir" onClick={(e) => e.stopPropagation()}>
            <ArrowSquareOut size={15} />
          </a>
        )}
      </span>
    </div>
  );
}

export default function VenueDrawerContent({ venueId, onCategorySelect }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(false);
  const [tab, setTab] = useState("about");
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(null);

  const showToast = (text) => {
    navigator.clipboard.writeText(text);
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  };

  useEffect(() => {
    if (!venueId) return;
    setLoading(true);
    setError("");
    setTab("about");
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
      {/* Hero: image with title overlay */}
      <div className="venue-detail-hero" onClick={venue.image_url ? () => setLightbox(true) : undefined}>
        {venue.image_url && (
          <img src={venue.image_url} alt={venue.name} className="venue-detail-image" />
        )}
        <div className="venue-detail-hero-overlay">
          <h2 className="venue-detail-title">{venue.name}</h2>
          <button
            className="venue-detail-category"
            onClick={(e) => { e.stopPropagation(); onCategorySelect?.(venue.category); }}
          >
            {venue.category}
          </button>
        </div>
      </div>

      {lightbox && venue.image_url && createPortal(
        <div className="venue-lightbox" onClick={() => setLightbox(false)}>
          <img src={venue.image_url} alt={venue.name} />
        </div>,
        document.body
      )}

      {toast && createPortal(
        <div className="copy-toast">Copiado para a área de transferência</div>,
        document.body
      )}

      <div className="venue-detail-body">
        <div className="venue-detail-tabs">
          <button className={`venue-detail-tab${tab === "about" ? " active" : ""}`} onClick={() => setTab("about")}>Sobre</button>
          <button className={`venue-detail-tab${tab === "reviews" ? " active" : ""}`} onClick={() => setTab("reviews")}>Avaliações</button>
        </div>

        {tab === "about" && (
          <>
            <div className="venue-detail-section venue-detail-section--first">
              <InfoRow
                icon={<MapPin size={18} />}
                text={<address style={{fontStyle:"normal"}}>{venue.address}</address>}
                onCopy={() => showToast(venue.address)}
              />
              {venue.phone && (
                <InfoRow
                  icon={<Phone size={18} />}
                  text={venue.phone}
                  onCopy={() => showToast(venue.phone)}
                />
              )}
              {venue.website && (
                <InfoRow
                  icon={<Globe size={18} />}
                  text={venue.website.replace(/^https?:\/\//, "")}
                  href={venue.website}
                  onCopy={() => showToast(venue.website)}
                />
              )}
            </div>
            {venue.description && (
              <div className="venue-detail-section venue-detail-section--no-border">
                <h3 className="venue-detail-section-title">Descrição</h3>
                <p className="venue-detail-desc">{venue.description}</p>
              </div>
            )}
          </>
        )}

        {tab === "reviews" && (
          <div className="venue-detail-section venue-detail-section--first">
            <p className="venue-detail-empty">Nenhuma avaliação ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
