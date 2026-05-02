import React, { useEffect, useState } from "react";
import { fetchArsenalResults, Match } from "../services/footballService";

const RESULT_COLORS: Record<string, string> = {
  W: "#2E8540",
  D: "#9C824A",
  L: "#EF0107",
};

export function RecentResults() {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArsenalResults()
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading recent results...</p>;
  if (results.length === 0) return null;

  return (
    <section className="recent-results" aria-label="Recent results">
      <h3 className="recent-results__title">Recent Results</h3>
      <div className="recent-results__grid">
        {results.map((r) => (
          <div key={r.matchId} className="recent-results__card">
            <span
              className="recent-results__badge"
              style={{ backgroundColor: RESULT_COLORS[r.result ?? "D"] }}
            >
              {r.result}
            </span>
            <div className="recent-results__score">
              <span className={r.homeTeam.includes("Arsenal") ? "recent-results__arsenal" : ""}>
                {r.homeTeam}
              </span>
              <strong>{r.homeScore} - {r.awayScore}</strong>
              <span className={r.awayTeam.includes("Arsenal") ? "recent-results__arsenal" : ""}>
                {r.awayTeam}
              </span>
            </div>
            <span className="recent-results__meta">
              {r.competition} · {new Date(r.kickoffTime).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
