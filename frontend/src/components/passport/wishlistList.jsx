import { WishlistCard } from "./wishlistCard.jsx";

export function WishlistList({ wishlist, venues, onRemoved }) {
  function getVenue(id) {
    return venues.find((v) => v.id === id);
  }

  if (wishlist.length === 0) {
    return (
      <p className="passport-message">
        Você ainda não adicionou nenhum local à sua lista de desejos.
      </p>
    );
  }

  return (
    <section className="passport-grid">
      {wishlist.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          venue={getVenue(item.venue_id)}
          onRemoved={onRemoved}
        />
      ))}
    </section>
  );
}
