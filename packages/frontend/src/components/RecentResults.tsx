import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface Result {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  matchDate: string;
  result: "W" | "D" | "L";
}

const RESULT_COLORS: Record<string, string> = {
  W: "#2E8540",
  D: "#9C824A",
  L: "#EF0107",
};

export function RecentResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_URL}/recent-results`);
        if (!response.ok) return;
        const data = await response.json();
        setResults(data.results ?? []);
      } catch {
        // Graceful degradation
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return null;
  if (results.length === 0) return null;

  return (
    <section className="recent-results" aria-label="Recent results">
      <h3 className="recent-results__title">Recent Results</h3>
      <div className="recent-results__grid">
        {results.map((r) => (
          <div key={r.matchId} className="recent-results__card">
            <span
              className="recent-results__badge"
              style={{ backgroundColor: RESULT_COLORS[r.result] }}
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
              {r.competition} · {new Date(r.matchDate).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
