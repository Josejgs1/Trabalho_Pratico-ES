import { useEffect, useState } from "react";

import { fetchRecords } from "../services/recordService.js";
import { fetchVenues } from "../services/venueService.js";

import { PassportHeader } from "../components/passport/passportHeader";
import { RecordList } from "../components/passport/recordList";
import { KultiLogo } from "../components/brand/kultiLogo.jsx";


export default function PassportPage() {
  const [records, setRecords] = useState([]);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [recordsData, venuesData] = await Promise.all([
          fetchRecords(),
          fetchVenues(),
        ]);

        setRecords(recordsData);
        setVenues(venuesData);
      } catch (err) {
        setError("Failed to load your passport.");
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
            onClick={() => (window.location.pathname = "/")}
          >
            ← Voltar
          </button>

          {/* 🧭 Logo clicável */}
          <div
            className="passport-logo"
            onClick={() => (window.location.pathname = "/")}
            style={{ cursor: "pointer" }}
          >
            <KultiLogo />
            <span>KULTI</span>
          </div>

          {/* 🧭 Nova avaliação */}
          <button
            className="new-record-button"
            onClick={() => (window.location.pathname = "/new-record")}
          >
            + New Review
          </button>

        </div>

        <PassportHeader />

        {loading && (
          <p className="passport-message">Loading your journey...</p>
        )}

        {error && <p className="passport-error">{error}</p>}

        {!loading && !error && (
          <RecordList records={records} venues={venues} />
        )}
      </div>
    </main>
  );
}