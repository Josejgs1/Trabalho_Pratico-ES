import { useState } from "react";
import { PencilSimple, Star } from "@phosphor-icons/react";
import { EditRecordModal } from "./editRecordModal";

export function RecordCard({ record, venue, onUpdated }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  function handleCardClick() {
    if (!venue?.id) return;
    window.location.href = `/map?venue=${venue.id}`;
  }

  function handleEditClick(e) {
    e.stopPropagation(); // 🔥 evita abrir o mapa
    setIsEditOpen(true);
  }

  return (
    <>
      <div
        className="passport-card clickable"
        onClick={handleCardClick}
      >
        {/* ✏️ BOTÃO EDIT */}
        <button
          className="edit-button"
          onClick={handleEditClick}
        >
          <PencilSimple size={18} />
        </button>

        <img
          src={venue?.image_url || "https://via.placeholder.com/400x200"}
          alt={venue?.name || "Imagem do local"}
          className="passport-card-image"
        />

        <div className="passport-card-content">
          <h3 className="passport-card-title">
            {venue?.name || "Local desconhecido"}
          </h3>

          <span className="passport-card-status">Visitado</span>

          <p className="passport-card-rating">
            <Star size={14} weight="fill" />
            {record.rating} / 5
          </p>

          {record.comment && (
            <p className="passport-card-comment">{record.comment}</p>
          )}
        </div>
      </div>

      <EditRecordModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        record={record}
        onSuccess={() => onUpdated && onUpdated()}
      />
    </>
  );
}
