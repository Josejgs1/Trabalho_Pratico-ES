import { useEffect, useState } from "react";
import { updateRecord } from "../../services/recordService.js";

/* 🔹 Tipos */
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

  /* 🔥 IMPORTANTE: sincronizar quando trocar o record */
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

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Falha ao atualizar registro.");
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

        <h2>Editar Avaliação</h2>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* ⭐ STARS */}
          <div className="field">
            <span>Nota</span>

            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${currentRating >= star ? "filled" : ""}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => handleRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* 💬 COMMENT */}
          <label className="field">
            <span>Comentário</span>
            <textarea
              value={form.comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              className="textarea-clean"
            />
          </label>

          {error && <p className="modal-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Update"}
          </button>

        </form>
      </div>
    </div>
  );
}