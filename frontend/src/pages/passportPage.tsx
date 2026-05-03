import { useEffect, useState } from "react";

import { fetchRecords } from "../services/recordService.js";
import { fetchVenues } from "../services/venueService.js";
import { listWishlist } from "../services/wishlistService.js";

import { PassportHeader } from "../components/passport/passportHeader";
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
  }, []);

  return (
    <main className="passport-page">
      <div className="passport-container">

        {/* 🔝 HEADER CUSTOM */}
        <div className="passport-top-bar">

          {/* 🔙 Botão voltar */}
          <button
            className="back-button"
            onClick={() => (window.location.pathname = "/map")}
          >
            ← Voltar
          </button>

          {/* 🧭 Logo clicável */}
          <div
            className="passport-logo"
            onClick={() => (window.location.pathname = "/map")}
            style={{ cursor: "pointer" }}
          >
            <KultiLogo />
            <span>KULTI</span>
          </div>

          {/* 🧭 Nova avaliação */}
          <button
            className="new-record-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Nova Avaliação
          </button>

        </div>

        <PassportHeader />

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
