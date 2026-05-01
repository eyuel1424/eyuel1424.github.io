import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface Scorer {
  playerName: string;
  teamName: string;
  goals: number;
  assists: number;
  matchesPlayed: number;
  isArsenal: boolean;
}

export function TopScorers() {
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScorers = async () => {
      try {
        const response = await fetch(`${API_URL}/top-scorers`);
        if (!response.ok) return;
        const data = await response.json();
        setScorers(data.scorers ?? []);
      } catch {
        // Graceful degradation
      } finally {
        setLoading(false);
      }
    };
    fetchScorers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (scorers.length === 0) return <p>No scorer data available.</p>;

  const displayed = showAll ? scorers : scorers.slice(0, 10);

  return (
    <section aria-label="Top scorers">
      <table className="usa-table" aria-label="Premier League top scorers">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Player</th>
            <th scope="col">Team</th>
            <th scope="col">Apps</th>
            <th scope="col">Goals</th>
            <th scope="col">Assists</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((s, i) => (
            <tr
              key={`${s.playerName}-${i}`}
              className={s.isArsenal ? "bg-red-warm-10v" : ""}
              aria-label={s.isArsenal ? `${s.playerName} (Arsenal)` : undefined}
            >
              <td>{i + 1}</td>
              <td style={{ fontWeight: s.isArsenal ? "bold" : "normal" }}>
                {s.playerName} {s.isArsenal && <span className="top-scorers__cannon" aria-label="Arsenal player">🔴</span>}
              </td>
              <td>{s.teamName}</td>
              <td>{s.matchesPlayed}</td>
              <td style={{ fontWeight: "bold" }}>{s.goals}</td>
              <td>{s.assists}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {scorers.length > 10 && (
        <button
          className="usa-button usa-button--unstyled top-scorers__toggle"
          onClick={() => setShowAll(!showAll)}
          type="button"
        >
          {showAll ? "Show top 10" : `Show all ${scorers.length}`}
        </button>
      )}
    </section>
  );
}
