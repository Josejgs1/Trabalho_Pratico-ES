import { useRef } from "react";
import "../../styles/mapOverlay.css";

export default function CategoryCarousel({ categories, active, onSelect }) {
  const listRef = useRef(null);

  const scroll = (dir) => {
    listRef.current?.scrollBy({ left: dir * 150, behavior: "smooth" });
  };

  return (
    <div className="category-carousel">
      <button className="carousel-arrow carousel-arrow--left" onClick={() => scroll(-1)}>‹</button>
      <div className="carousel-list" ref={listRef}>
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
      <button className="carousel-arrow carousel-arrow--right" onClick={() => scroll(1)}>›</button>
    </div>
  );
}
