import { RecordCard } from "./recordCard.jsx";

export function RecordList({ records, venues }) {
  function getVenue(id) {
    return venues.find((v) => v.id === id);
  }

  if (records.length === 0) {
    return (
      <p className="passport-message">
        You haven’t visited any venues yet.
      </p>
    );
  }

  return (
    <section className="passport-grid">
      {records.map((record) => {
        const venue = getVenue(record.venue_id);

        return (
          <RecordCard
            key={record.id}
            record={record}
            venue={venue}
          />
        );
      })}
    </section>
  );
}