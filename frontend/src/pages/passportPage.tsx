import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

import { fetchRecords } from "../services/recordService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { fetchVenues } from "../services/venueService.js";
import { listWishlist } from "../services/wishlistService.js";

import { PassportHeader } from "../components/passport/passportHeader";
import { RecommendationPanel } from "../components/passport/recommendationPanel.jsx";
import { RecordList } from "../components/passport/recordList";
import { WishlistList } from "../components/passport/wishlistList";
import { KultiLogo } from "../components/brand/kultiLogo.jsx";
import { CreateRecordModal } from "../components/passport/createRecordModal";

export default function PassportPage() {
  const [records, setRecords] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState("records");
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationError, setRecommendationError] = useState("");
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  async function reloadRecommendations({ forceRefresh = false } = {}) {
    setRecommendationLoading(true);
    setRecommendationError("");

    try {
      const data = await fetchRecommendations({ forceRefresh });
      setRecommendation(data);
    } catch (err) {
      setRecommendation(null);
      setRecommendationError("Não foi possível carregar seu roteiro agora.");
    } finally {
      setRecommendationLoading(false);
    }
  }

  async function reloadRecords() {
    const data = await fetchRecords();
    setRecords(data);
  }

  async function reloadWishlist() {
    const data = await listWishlist();
    setWishlist(data);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [recordsData, venuesData, wishlistData] = await Promise.all([
          fetchRecords(),
          fetchVenues(),
          listWishlist(),
        ]);

        setRecords(recordsData);
        setVenues(venuesData);
        setWishlist(wishlistData);
      } catch (err) {
        setError("Falha ao carregar seu passaporte");
      } finally {
        setLoading(false);
      }
    }

    loadData();
    reloadRecommendations();
  }, []);

  return (
    <main className="passport-page">
      <div className="passport-container">

        {/* HEADER CUSTOM */}
        <div className="passport-top-bar">

          {/* Go back */}
          <button
            className="back-button"
            onClick={() => (window.location.pathname = "/map")}
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>

          {/* Logo */}
          <div
            className="passport-logo"
            onClick={() => (window.location.pathname = "/map")}
            style={{ cursor: "pointer" }}
          >
            <KultiLogo />
            <span>KULTI</span>
          </div>

          {/* New record */}
          <button
            className="new-record-button"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Nova Avaliação</span>
          </button>

        </div>

        <PassportHeader />

        <RecommendationPanel
          error={recommendationError}
          loading={recommendationLoading}
          recommendation={recommendation}
        />

        {loading && (
          <p className="passport-message">Loading your journey...</p>
        )}

        {error && <p className="passport-error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="passport-tabs">
              <button
                className={`passport-tab${tab === "records" ? " active" : ""}`}
                onClick={() => setTab("records")}
              >
                Visitados
              </button>
              <button
                className={`passport-tab${tab === "wishlist" ? " active" : ""}`}
                onClick={() => setTab("wishlist")}
              >
                Quero visitar
              </button>
            </div>

            {tab === "records" && (
              <RecordList
                records={records}
                venues={venues}
                onUpdated={reloadRecords}
              />
            )}

            {tab === "wishlist" && (
              <WishlistList
                wishlist={wishlist}
                venues={venues}
                onRemoved={reloadWishlist}
              />
            )}
          </>
        )}

        <CreateRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={reloadRecords}
        />
      </div>
    </main>
  );
}
