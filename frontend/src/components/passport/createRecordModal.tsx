import { useEffect, useState } from "react";

import { fetchVenues } from "../../services/venueService.js";
import { createRecord } from "../../services/recordService.js";

export function CreateRecordModal({ isOpen, onClose, onSuccess }) {
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    venue_id: "",
    rating: 5,
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    async function loadVenues() {
      try {
        const data = await fetchVenues();
        setVenues(data);
      } catch {
        setError("Failed to load venues.");
      }
    }

    loadVenues();
  }, [isOpen]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createRecord({
        venue_id: form.venue_id,
        rating: Number(form.rating),
        comment: form.comment || null,
      });

      onSuccess();   // 🔥 recarrega lista
      onClose();     // fecha modal

    } catch (err) {
      setError(err.message || "Failed to create record.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">

      <div className="modal">

        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>Create Review</h2>

        <form onSubmit={handleSubmit} className="modal-form">

          <label>
            Venue
            <select
              name="venue_id"
              value={form.venue_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a venue</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Rating
            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
            >
              {[1,2,3,4,5].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>
          </label>

          <label>
            Comment
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={4}
            />
          </label>

          {error && <p className="modal-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create"}
          </button>

        </form>

      </div>
    </div>
  );
}