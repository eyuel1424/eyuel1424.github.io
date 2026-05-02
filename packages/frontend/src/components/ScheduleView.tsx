import React, { useEffect, useState } from "react";
import { fetchArsenalFixtures, Match } from "../services/footballService";
import { RecentResults } from "./RecentResults";
import { InjuryReport } from "./InjuryReport";

function isWithin24Hours(kickoffTime: string): boolean {
  const kickoff = new Date(kickoffTime).getTime();
  const now = Date.now();
  return kickoff - now > 0 && kickoff - now <= 24 * 60 * 60 * 1000;
}

export function ScheduleView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArsenalFixtures()
      .then(data => { setMatches(data); setLoading(false); })
      .catch(() => { setError("Unable to load fixtures."); setLoading(false); });
  }, []);

  return (
    <section aria-label="Schedule and results">
      <h2 className="usa-heading">Schedule & Results</h2>
      <RecentResults />
      <h3 style={{ marginTop: "2rem" }}>Upcoming Matches</h3>
      {loading && <p>Loading fixtures...</p>}
      {error && <p style={{ color: "#EF0107" }}>{error}</p>}
      {!loading && !error && matches.length === 0 && <p>No upcoming matches scheduled.</p>}
      {matches.length > 0 && (
        <table className="usa-table usa-table--borderless" aria-label="Match schedule">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Kickoff</th>
              <th scope="col">Opponent</th>
              <th scope="col">Competition</th>
              <th scope="col">Venue</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const kickoff = new Date(match.kickoffTime);
              const highlight = isWithin24Hours(match.kickoffTime);
              const isHome = match.homeTeam.includes("Arsenal");
              const opponent = isHome ? match.awayTeam : match.homeTeam;
              return (
                <tr key={match.matchId} className={highlight ? "bg-gold-lighter" : ""}>
                  <td>{kickoff.toLocaleDateString()}</td>
                  <td>{kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td>{opponent} {isHome ? "(H)" : "(A)"}</td>
                  <td>{match.competition}</td>
                  <td>{match.venue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <InjuryReport />
    </section>
  );
}
