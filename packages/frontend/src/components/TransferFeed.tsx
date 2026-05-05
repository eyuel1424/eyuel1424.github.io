import React, { useEffect, useState } from "react";
import { fetchArsenalTransfers, TransferItem } from "../services/newsService";

const ALL_TYPES = [
  { value: "", label: "All" },
  { value: "rumor", label: "Rumors" },
  { value: "confirmed_signing", label: "Confirmed" },
  { value: "loan", label: "Loans" },
  { value: "contract_extension", label: "Extensions" },
  { value: "departure", label: "Departures" },
];

const TYPE_COLORS: Record<string, string> = {
  rumor: "#9C824A",
  confirmed_signing: "#2E8540",
  loan: "#1e3a8a",
  contract_extension: "#5b21b6",
  departure: "#EF0107",
};

const TYPE_LABELS: Record<string, string> = {
  rumor: "Rumor",
  confirmed_signing: "Confirmed",
  loan: "Loan",
  contract_extension: "Extension",
  departure: "Departure",
};

const PLAYER_KEYWORDS = ["sign", "transfer", "loan", "depart", "exit", "bid", "fee", "contract", "extension", "linked", "move", "join", "leave", "sold", "release", "swap", "deal", "target", "rumour", "rumor"];
const EXCLUDE_KEYWORDS = ["score", "goal", "match result", "win", "lose", "draw", "league table", "standings", "fixture", "kickoff", "preview", "highlights", "analysis"];

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function TransferFeed() {
  const [items, setItems] = useState<TransferItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArsenalTransfers()
      .then(data => {
        const yesterday = Date.now() - 24 * 60 * 60 * 1000;
        const filtered = data.filter(item => {
          const text = (item.title + " " + item.summary).toLowerCase();
          const hasPlayerKeyword = PLAYER_KEYWORDS.some(k => text.includes(k));
          const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(k => text.includes(k));
          const isRecent = new Date(item.publicationDate).getTime() > yesterday;
          return hasPlayerKeyword && !hasExcludeKeyword && isRecent;
        });
        setItems(filtered);
        setLoading(false);
      })
      .catch(() => { setError("Unable to load transfer news."); setLoading(false); });
  }, []);

  const displayed = filter ? items.filter(i => i.transferType === filter) : items;

  return (
    <section aria-label="Transfer news" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "3px solid #EF0107", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
        Transfer News
      </h2>
      <p style={{ color: "#9CA3AF", fontSize: "0.82rem", marginBottom: "1rem", marginTop: "-1rem" }}>Last 24 hours only · Player transfers</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {ALL_TYPES.map(({ value, label }) => (
          <button key={value} onClick={() => setFilter(value)} type="button" style={{ padding: "0.35rem 1rem", borderRadius: "20px", border: `2px solid ${filter === value ? "#EF0107" : "rgba(255,255,255,0.2)"}`, background: filter === value ? "#EF0107" : "transparent", color: filter === value ? "white" : "inherit", fontWeight: "600", fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.03em" }}>
            {label}
          </button>
        ))}
      </div>
      {loading && <p>Loading transfer news...</p>}
      {error && <p style={{ color: "#EF0107" }}>{error}</p>}
      {!loading && !error && displayed.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9CA3AF" }}>
          <p style={{ fontSize: "2rem" }}>⚽</p>
          <p>{filter ? `No ${filter.replace("_", " ")} transfers in the last 24 hours.` : "No player transfer activity in the last 24 hours."}</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {displayed.map((item) => (
          <div key={item.contentId} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "1rem 1.25rem", borderLeft: `4px solid ${TYPE_COLORS[item.transferType] ?? "#EF0107"}`, transition: "background 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ background: TYPE_COLORS[item.transferType] ?? "#EF0107", color: "white", padding: "2px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase" }}>{TYPE_LABELS[item.transferType] ?? item.transferType}</span>
              <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{item.sourceName} · {timeAgo(item.publicationDate)}</span>
            </div>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "700", fontSize: "0.98rem", display: "block", marginBottom: "0.4rem", color: "#60a5fa", textDecoration: "none", lineHeight: "1.4" }}>{item.title}</a>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#9CA3AF", lineHeight: "1.6" }}>{item.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}