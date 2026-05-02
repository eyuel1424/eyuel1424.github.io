import React, { useEffect, useState } from "react";
import { fetchLiveMatch, Match } from "../services/footballService";

export function Scoreboard() {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const live = await fetchLiveMatch();
        setMatch(live);
      } catch {
        // Silently fail
      }
    };
    poll();
    const interval = setInterval(poll, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!match) return null;

  return (
    <section className="usa-alert usa-alert--info" aria-label="Live scoreboard" aria-live="polite">
      <div className="usa-alert__body" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span className="usa-tag bg-red">LIVE</span>
        <span style={{ fontSize: "1.2em", fontWeight: "bold" }}>
          {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
        </span>
        {match.matchMinute && <span className="text-base-dark">{match.matchMinute}'</span>}
      </div>
    </section>
  );
}
