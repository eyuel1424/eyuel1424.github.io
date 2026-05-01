import React, { useEffect, useState } from "react";
import { RecentResults } from "./RecentResults";
import { InjuryReport } from "./InjuryReport";
import { HeadToHead } from "./HeadToHead";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface ScheduleMatch {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  venue: string;
  kickoffTime: string;
  status: string;
}

function isWithin24Hours(kickoffTime: string): boolean {
  const kickoff = new Date(kickoffTime).getTime();
  const now = Date.now();
  return kickoff - now > 0 && kickoff - now <= 24 * 60 * 60 * 1000;
}

function getNextOpponent(matches: ScheduleMatch[]): string {
  if (matches.length === 0) return "";
  const next = matches[0];
  return next.homeTeam.includes("Arsenal") ? next.awayTeam : next.homeTeam;
}

export function ScheduleView() {
  const [matches, setMatches] = useState<ScheduleMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`${API_URL}/schedule`);
        if (!response.ok) throw new Error("Failed to fetch schedule");
        const data = await response.json();
        setMatches(data.matches ?? []);
      } catch {
        // Graceful degradation
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const nextOpponent = getNextOpponent(matches);

  return (
    <section aria-label="Schedule and results">
      <h2 className="usa-heading">Schedule & Results</h2>

      <RecentResults />

      <h3 className="schedule__subtitle">Upcoming Matches</h3>
      {loading && <p>Loading...</p>}
      {!loading && matches.length === 0 && <p>No upcoming matches scheduled.</p>}
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
              const homeAway = isHome ? "(H)" : "(A)";

              return (
                <tr
                  key={match.matchId}
                  className={highlight ? "bg-gold-lighter" : ""}
                  aria-label={highlight ? "Match within 24 hours" : undefined}
                >
                  <td>{kickoff.toLocaleDateString()}</td>
                  <td>{kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td>{opponent} {homeAway}</td>
                  <td>{match.competition}</td>
                  <td>{match.venue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {nextOpponent && <HeadToHead opponent={nextOpponent} />}

      <InjuryReport />
    </section>
  );
}
