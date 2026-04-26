import "../../styles/mapOverlay.css";

export default function VenueListContent({ venues, category, onVenueClick }) {
  return (
    <div className="venue-list">
      <div className="venue-list-header">
        <h2 className="venue-list-title">{category}</h2>
        <span className="venue-list-count">{venues.length} resultados</span>
      </div>
      {venues.map((venue) => (
        <button
          key={venue.id}
          className="venue-list-item"
          onClick={() => onVenueClick(venue)}
        >
          {venue.image_url && (
            <img
              src={venue.image_url}
              alt={venue.name}
              className="venue-list-thumb"
            />
          )}
          <div className="venue-list-info">
            <span className="venue-list-name">{venue.name}</span>
            <span className="venue-list-category">{venue.category}</span>
            <span className="venue-list-address">{venue.address}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
