import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import "../../styles/mapOverlay.css";

export default function CategoryCarousel({ categories, active, onSelect }) {
  const listRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = listRef.current;
    el?.addEventListener("scroll", updateArrows);
    return () => el?.removeEventListener("scroll", updateArrows);
  }, [categories, updateArrows]);

  const scroll = (dir) => {
    listRef.current?.scrollBy({ left: dir * 150, behavior: "smooth" });
  };

  return (
    <div className="category-carousel">
      {canScrollLeft && (
        <button className="carousel-arrow carousel-arrow--left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <CaretLeft size={14} weight="bold" />
        </button>
      )}
      <div className={`carousel-list${canScrollLeft ? " carousel-fade-left" : ""}${canScrollRight ? " carousel-fade-right" : ""}`} ref={listRef}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-chip${active === cat ? " category-chip--active" : ""}`}
            onClick={() => onSelect(active === cat ? null : cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <button className="carousel-arrow carousel-arrow--right" onClick={() => scroll(1)} aria-label="Scroll right">
          <CaretRight size={14} weight="bold" />
        </button>
      )}
    </div>
  );
}
