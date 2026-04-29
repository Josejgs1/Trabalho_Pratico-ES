export function RecordCard({ record, venue }) {
  return (
    <div className="passport-card">
      <img
        src={venue?.image_url || "https://via.placeholder.com/400x200"}
        alt={venue?.name || "Venue image"}
        className="passport-card-image"
      />

      <div className="passport-card-content">
        <h3 className="passport-card-title">
          {venue?.name || "Unknown venue"}
        </h3>

        <span className="passport-card-status">Visited</span>

        <p className="passport-card-rating">
          ⭐ {record.rating} / 5
        </p>

        {record.comment && (
          <p className="passport-card-comment">{record.comment}</p>
        )}
      </div>
    </div>
  );
}