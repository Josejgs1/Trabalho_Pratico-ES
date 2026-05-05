import { useEffect, useState } from "react";
import { Star } from "@phosphor-icons/react";

import { fetchVenues } from "../../services/venueService.js";
import { createRecord } from "../../services/recordService.js";

type CreateRecordModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialVenueId?: string;
};

type Venue = {
    id: string;
    name: string;
    image_url?: string;
};

type FormState = {
    venue_id: string;
    rating: number;
    comment: string;
};

export function CreateRecordModal({
    isOpen,
    onClose,
    onSuccess,
    initialVenueId
}: CreateRecordModalProps) {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [query, setQuery] = useState("");
    const [filtered, setFiltered] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

    const [form, setForm] = useState<FormState>({
        venue_id: initialVenueId || "",
        rating: 0,
        comment: "",
    });

    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!initialVenueId || venues.length === 0) return;

        const venue = venues.find((v) => v.id === initialVenueId);

        if (venue) {
            setSelectedVenue(venue);
            setQuery(venue.name);
            setForm((prev) => ({
                ...prev,
                venue_id: venue.id,
            }));
        }
    }, [initialVenueId, venues]);

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            venue_id: initialVenueId || "",
            rating: 0,
            comment: "",
        });
        setQuery("");
        setSelectedVenue(null);
        setFiltered([]);
        setHoverRating(null);
        setError("");
    }, [isOpen, initialVenueId]);

    useEffect(() => {
        if (!isOpen) return;

        async function loadVenues() {
            try {
                const data = await fetchVenues();
                setVenues(data);
            } catch (err: any) {
                const message =
                    err?.response?.data?.detail || 
                    err?.detail ||  
                    err?.message || 
                    "Erro ao criar avaliação.";

                setError(message);
            }
        }

        loadVenues();
    }, [isOpen]);

    useEffect(() => {
        const q = query.trim().toLowerCase();

        if (q.length < 2) {
            setFiltered([]);
            return;
        }

        setFiltered(
            venues.filter((v) => v.name.toLowerCase().includes(q)).slice(0, 5)
        );
    }, [query, venues]);

    function selectVenue(v: Venue) {
        setForm({ ...form, venue_id: v.id });
        setQuery(v.name);
        setSelectedVenue(v);
        setFiltered([]);
    }

    function handleRating(value: number) {
        setForm({ ...form, rating: value });
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await createRecord({
                venue_id: form.venue_id,
                rating: form.rating,
                comment: form.comment || null,
            });

            onClose();
            onSuccess();

        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("Failed to create record.");
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

                <div className="modal-header">
                    <h2>Nova Avaliação</h2>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* AUTOCOMPLETE */}
                    <label className="field">
                        <span>Museu</span>

                        <input
                            type="text"
                            placeholder="Busque um museu..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedVenue(null);
                            }}
                            className="input-clean"
                            required
                        />

                        {selectedVenue && (
                            <div className="venue-preview">
                                <img
                                    src={selectedVenue.image_url || "https://via.placeholder.com/60"}
                                    alt={selectedVenue.name}
                                />
                                <div>
                                    <p className="venue-name">{selectedVenue.name}</p>
                                    <span className="venue-selected">Selecionado</span>
                                </div>
                            </div>
                        )}

                        {query.trim().length > 0 && filtered.length > 0 && (
                            <div className="autocomplete">
                                {filtered.map((v) => (
                                    <div
                                        key={v.id}
                                        className="autocomplete-item"
                                        onClick={() => selectVenue(v)}
                                    >
                                        {v.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </label>

                    {/* RATING */}
                    <div className="field">
                        <span>Nota</span>

                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const current = hoverRating ?? form.rating;

                                return (
                                    <span
                                        key={star}
                                        className="star"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(null)}
                                        onClick={() => handleRating(star)}
                                    >
                                        <Star
                                            size={22}
                                            weight={current >= star ? "fill" : "regular"}
                                            className="star-icon"
                                            data-filled={current >= star}
                                        />
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* COMMENT */}
                    <label className="field">
                        <span>Comentário</span>
                        <textarea
                            name="comment"
                            value={form.comment}
                            onChange={(e) =>
                                setForm({ ...form, comment: e.target.value })
                            }
                            placeholder="Conte sua opinião..."
                            className="textarea-clean"
                        />
                    </label>

                    {error && <p className="modal-error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Criar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
