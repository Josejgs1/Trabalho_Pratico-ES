import { Heart } from "@phosphor-icons/react";
import { removeFromWishlist } from "../../services/wishlistService.js";

export function WishlistCard({ item, venue, onRemoved }) {
  function handleCardClick() {
    if (!venue?.id) return;
    window.location.href = `/map?venue=${venue.id}`;
  }

  function handleRemove(e) {
    e.stopPropagation();
    removeFromWishlist(item.venue_id).then(() => onRemoved?.());
  }

  return (
    <div className="passport-card clickable" onClick={handleCardClick}>
      <button className="venue-detail-wishlist active" onClick={handleRemove} title="Remover da lista">
        <Heart size={20} weight="fill" />
      </button>
      <img
        src={venue?.image_url || "https://via.placeholder.com/400x200"}
        alt={venue?.name || "Venue image"}
        className="passport-card-image"
      />
      <div className="passport-card-content">
        <h3 className="passport-card-title">{venue?.name || "Local desconhecido"}</h3>
        {venue?.category && <span className="passport-card-tag">{venue.category}</span>}
        {venue?.address && <p className="passport-card-address">{venue.address}</p>}
      </div>
    </div>
  );
}
