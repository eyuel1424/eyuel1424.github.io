import React, { useEffect, useState } from "react";
import { fetchArsenalFixtures, fetchArsenalResults, Match } from "../services/footballService";
import { InjuryReport } from "./InjuryReport";

const RESULT_COLORS = {
  W: { bg: "#2E8540", label: "W" },
  D: { bg: "#9C824A", label: "D" },
  L: { bg: "#EF0107", label: "L" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isWithin24Hours(dateStr: string): boolean {
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

function shortName(name: string): string {
  return name.replace(" FC", "").replace(" United", " Utd").replace("Club Atletico de Madrid", "Atletico Madrid");
}

export function ScheduleView() {
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([fetchArsenalFixtures(), fetchArsenalResults()])
      .then(([fix, res]) => {
        if (fix.status === "fulfilled") setFixtures(fix.value);
        if (res.status === "fulfilled") setResults(res.value);
        setLoading(false);
      });
  }, []);

  return (
    <section aria-label="Schedule and results">
      <h2 className="usa-heading">Schedule & Results</h2>

      {results.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ borderBottom: "2px solid #EF0107", paddingBottom: "0.5rem", marginBottom: "1.25rem", fontSize: "1.1rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Recent Results</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {results.map((r) => {
              const resultKey = r.result as "W" | "D" | "L" | undefined;
              const rs = resultKey ? RESULT_COLORS[resultKey] : RESULT_COLORS.D;
              const isHome = r.homeTeam.includes("Arsenal");
              const opponent = shortName(isHome ? r.awayTeam : r.homeTeam);
              return (
                <div key={r.matchId} style={{ background: "#1e3a5f", borderRadius: "10px", padding: "1rem", textAlign: "center", borderTop: `3px solid ${rs.bg}` }}>
                  <span style={{ background: rs.bg, color: "white", padding: "3px 14px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", display: "inline-block", marginBottom: "0.6rem" }}>{rs.label}</span>
                  <p style={{ margin: "0 0 0.3rem 0", fontWeight: "bold", fontSize: "0.95rem" }}>{isHome ? "Arsenal" : opponent}</p>
                  <p style={{ margin: "0 0 0.3rem 0", fontSize: "1.4rem", fontWeight: "800", color: "white", letterSpacing: "0.1em" }}>{r.homeScore} - {r.awayScore}</p>
                  <p style={{ margin: "0 0 0.3rem 0", fontWeight: "bold", fontSize: "0.95rem" }}>{isHome ? opponent : "Arsenal"}</p>
                  <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.72rem", color: "#9CA3AF" }}>{r.competition.replace("UEFA ", "").replace("Premier League", "PL")} · {new Date(r.kickoffTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ borderBottom: "2px solid #EF0107", paddingBottom: "0.5rem", marginBottom: "1.25rem", fontSize: "1.1rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Upcoming Matches</h3>
        {loading && <p>Loading fixtures...</p>}
        {!loading && fixtures.length === 0 && <p style={{ color: "#9CA3AF" }}>No upcoming matches scheduled.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {fixtures.map((match, idx) => {
            const isHome = match.homeTeam.includes("Arsenal");
            const opponent = shortName(isHome ? match.awayTeam : match.homeTeam);
            const highlight = isWithin24Hours(match.kickoffTime);
            const isNext = idx === 0;
            return (
              <div key={match.matchId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isNext ? "linear-gradient(135deg, #1e3a5f, #2d5fa6)" : "#1e3a5f", borderRadius: "10px", padding: "1rem 1.5rem", borderLeft: highlight ? "4px solid #F59E0B" : isNext ? "4px solid #60a5fa" : "4px solid #EF0107", gap: "1rem", flexWrap: "wrap", boxShadow: isNext ? "0 2px 12px rgba(96, 165, 250, 0.15)" : "none" }}>
                <div style={{ flex: 1 }}>
                  {isNext && <span style={{ fontSize: "0.7rem", color: "#60a5fa", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.3rem" }}>Next Match</span>}
                  <p style={{ margin: 0, fontWeight: "800", fontSize: "1.05rem", letterSpacing: "0.02em" }}>
                    Arsenal {isHome ? "vs" : "@"} {opponent}
                  </p>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.82rem", color: "#9CA3AF" }}>
                    {match.competition.replace("UEFA ", "")} · {isHome ? "Emirates Stadium" : "Away"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem", color: highlight ? "#F59E0B" : isNext ? "#60a5fa" : "inherit" }}>{formatDate(match.kickoffTime)}</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#9CA3AF" }}>{formatTime(match.kickoffTime)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <InjuryReport />
    </section>
  );
}