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

const CONFIRMED_TYPES = ["confirmed_signing", "loan", "contract_extension", "departure"];

function transferLabel(type: string): string {
  const labels: Record<string, string> = {
    rumor: "Rumor",
    confirmed_signing: "Confirmed",
    loan: "Loan",
    contract_extension: "Extension",
    departure: "Departure",
  };
  return labels[type] ?? type;
}

function timeAgoShort(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TransferFeed() {
  const [items, setItems] = useState<TransferItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArsenalTransfers()
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => { setError("Unable to load transfer news."); setLoading(false); });
  }, []);

  const displayed = filter ? items.filter(i => i.transferType === filter) : items;

  return (
    <section aria-label="Transfer news">
      <h2 className="usa-heading">Transfer News</h2>
      <div className="filter-type-row" role="group" aria-label="Transfer type filter">
        {ALL_TYPES.map(({ value, label }) => (
          <button
            key={value}
            className={`filter-chip ${filter === value ? "filter-chip--active" : ""}`}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      {loading && <p>Loading transfer news...</p>}
      {error && (
        <div className="usa-alert usa-alert--error" role="alert">
          <div className="usa-alert__body"><p className="usa-alert__text">{error}</p></div>
        </div>
      )}
      {!loading && !error && displayed.length === 0 && (
        <p>{filter ? `No ${filter.replace("_", " ")} transfers found.` : "No transfer activity found. Check back soon."}</p>
      )}
      <ul className="usa-list usa-list--unstyled">
        {displayed.map((item) => {
          const isConfirmed = CONFIRMED_TYPES.includes(item.transferType);
          return (
            <li key={item.contentId} className="usa-card__container margin-bottom-2">
              <div className="usa-card__body">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span className={`usa-tag ${isConfirmed ? "bg-green" : "bg-gold"}`}>
                    {transferLabel(item.transferType)}
                  </span>
                  <span className="text-base-dark font-sans-3xs">
                    {item.sourceName} · {timeAgoShort(item.publicationDate)}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="usa-link">
                    {item.title}
                  </a>
                </h3>
                <p style={{ margin: 0 }}>{item.summary}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
