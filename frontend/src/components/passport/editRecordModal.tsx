import { useEffect, useState } from "react";
import { Star } from "@phosphor-icons/react";
import { updateRecord } from "../../services/recordService.js";

/* Types */
type RecordType = {
  id: string;
  rating: number;
  comment: string | null;
};

type EditRecordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  record: RecordType;
  onSuccess: () => void;
};

type FormState = {
  rating: number;
  comment: string;
};

export function EditRecordModal({
  isOpen,
  onClose,
  record,
  onSuccess,
}: EditRecordModalProps) {
  const [form, setForm] = useState<FormState>({
    rating: record.rating,
    comment: record.comment || "",
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /* Sync when record changes */
  useEffect(() => {
    if (record) {
      setForm({
        rating: record.rating,
        comment: record.comment || "",
      });
    }
  }, [record]);

  function handleRating(value: number) {
    setForm((prev) => ({ ...prev, rating: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateRecord(record.id, form);

      onClose();
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update record.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const currentRating = hoverRating ?? form.rating;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h2>Editar Avaliação</h2>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* RATING */}
          <div className="field">
            <span>Nota</span>

            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="star"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => handleRating(star)}
                >
                  <Star
                    size={22}
                    weight={currentRating >= star ? "fill" : "regular"}
                    className="star-icon"
                    data-filled={currentRating >= star}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* COMMENT */}
          <label className="field">
            <span>Comentário</span>
            <textarea
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              placeholder="Conte sua opinião..."
              className="textarea-clean"
            />
          </label>

          {error && <p className="modal-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Atualizar"}
          </button>

        </form>
      </div>
    </div>
  );
}