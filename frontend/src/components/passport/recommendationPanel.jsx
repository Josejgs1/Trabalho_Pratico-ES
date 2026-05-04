import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, Heart } from "@phosphor-icons/react";
import { addToWishlist, checkWishlistStatus, removeFromWishlist } from "../../services/wishlistService.js";

function openVenue(venueId) {
  window.location.href = `/map?venue=${venueId}`;
}

export function RecommendationPanel({ error, loading, recommendation }) {
  const listRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [wishlistedById, setWishlistedById] = useState({});

  const updateArrows = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();

    const el = listRef.current;
    el?.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    return () => {
      el?.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [recommendation, updateArrows]);

  useEffect(() => {
    if (!recommendation) return;

    Promise.all(
      recommendation.venues.map((venue) =>
        checkWishlistStatus(venue.id)
          .then((res) => [venue.id, res.wishlisted])
          .catch(() => [venue.id, false]),
      ),
    ).then((entries) => setWishlistedById(Object.fromEntries(entries)));
  }, [recommendation]);

  const scroll = useCallback((direction) => {
    const el = listRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction * el.clientWidth,
      behavior: "smooth",
    });
  }, []);

  const toggleWishlist = useCallback((venueId) => {
    const next = !wishlistedById[venueId];
    setWishlistedById((current) => ({ ...current, [venueId]: next }));
    (next ? addToWishlist(venueId) : removeFromWishlist(venueId)).catch(() => {
      setWishlistedById((current) => ({ ...current, [venueId]: !next }));
    });
  }, [wishlistedById]);

  if (loading) {
    return (
      <section className="recommendation-panel">
        <p className="recommendation-status">Preparando recomendações...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recommendation-panel recommendation-panel--muted">
        <h2 className="recommendation-title">Roteiro indisponível</h2>
        <p className="recommendation-status">{error}</p>
      </section>
    );
  }

  if (!recommendation || recommendation.venues.length === 0) {
    return (
      <section className="recommendation-panel recommendation-panel--muted">
        <h2 className="recommendation-title">
          Ainda não há recomendações disponíveis
        </h2>
        <p className="recommendation-status">
          Registre visitas ou adicione locais à sua lista para receber um roteiro.
        </p>
      </section>
    );
  }

  const usedFallback = recommendation.source === "popularity_fallback";
  const isAi = recommendation.source === "ai";

  return (
    <section className="recommendation-panel">
      <div className="recommendation-heading">
        <div>
          <span className="recommendation-kicker">Roteiro recomendado</span>
          <h2 className="recommendation-title">
            {recommendation.itinerary_title}
          </h2>
        </div>
        {(usedFallback || isAi) && (
          <span className={`recommendation-badge${isAi ? " recommendation-badge--ai" : ""}`}>
            {isAi ? "Gerado por IA" : "Popularidade"}
          </span>
        )}
      </div>

      <p className="recommendation-note">{recommendation.curator_note}</p>

      {usedFallback && recommendation.fallback_reason && (
        <p className="recommendation-fallback">
          {recommendation.fallback_reason}
        </p>
      )}

      <div className="recommendation-carousel">
        {canScrollLeft && (
          <button
            aria-label="Ver recomendação anterior"
            className="carousel-arrow carousel-arrow--left recommendation-arrow"
            onClick={() => scroll(-1)}
            type="button"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
        )}

        <div className="recommendation-list" ref={listRef}>
          {recommendation.venues.map((venue) => (
            <div
              className="recommendation-card"
              key={venue.id}
              onClick={() => openVenue(venue.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openVenue(venue.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <button
                aria-label={wishlistedById[venue.id] ? "Remover da wishlist" : "Adicionar à wishlist"}
                className={`venue-detail-wishlist${wishlistedById[venue.id] ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(venue.id);
                }}
                type="button"
              >
                <Heart size={20} weight={wishlistedById[venue.id] ? "fill" : "regular"} />
              </button>
              <img
                alt={venue.name}
                className="recommendation-image"
                src={venue.image_url || "https://via.placeholder.com/400x220"}
              />
              <span className="recommendation-card-body">
                <span className="recommendation-category">{venue.category}</span>
                <span className="recommendation-name">{venue.name}</span>
                <span className="recommendation-address">{venue.address}</span>
                <span className="recommendation-justification">
                  {venue.justification}
                </span>
              </span>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            aria-label="Ver próxima recomendação"
            className="carousel-arrow carousel-arrow--right recommendation-arrow"
            onClick={() => scroll(1)}
            type="button"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        )}
      </div>
    </section>
  );
}
