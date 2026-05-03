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
