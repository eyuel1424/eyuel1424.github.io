import React, { useEffect, useState } from "react";
import { fetchPremierLeagueStandings, Standing } from "../services/footballService";
import { TopScorers } from "./TopScorers";

function FormIndicator({ form }: { form: string[] }) {
  return (
    <span>
      {form.slice(0, 5).map((result, i) => {
        const color = result === "W" ? "green" : result === "D" ? "gold" : "red";
        return (
          <span key={i} style={{
            display: "inline-block", width: "1.2em", height: "1.2em",
            lineHeight: "1.2em", textAlign: "center", borderRadius: "2px",
            backgroundColor: color, color: "white", fontSize: "0.75em",
            marginRight: "2px", fontWeight: "bold",
          }}>
            {result}
          </span>
        );
      })}
    </span>
  );
}

export function StandingsTable() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPremierLeagueStandings()
      .then(data => { setStandings(data); setLoading(false); })
      .catch(() => { setError("Unable to load standings."); setLoading(false); });
  }, []);

  return (
    <section aria-label="League standings">
      <h2 className="usa-heading">Premier League Standings</h2>
      {loading && <p>Loading standings...</p>}
      {error && <p style={{ color: "#EF0107" }}>{error}</p>}
      {!loading && !error && standings.length === 0 && <p>No standings available.</p>}
      {standings.length > 0 && (
        <table className="usa-table" aria-label="Premier League standings">
          <thead>
            <tr>
              <th scope="col">Pos</th>
              <th scope="col">Team</th>
              <th scope="col">P</th>
              <th scope="col">W</th>
              <th scope="col">D</th>
              <th scope="col">L</th>
              <th scope="col">GF</th>
              <th scope="col">GA</th>
              <th scope="col">GD</th>
              <th scope="col">Pts</th>
              <th scope="col">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry) => (
              <tr
                key={entry.position}
                className={entry.teamName.includes("Arsenal") ? "bg-red-warm-10v" : ""}
              >
                <td>{entry.position}</td>
                <td style={{ fontWeight: entry.teamName.includes("Arsenal") ? "bold" : "normal" }}>
                  {entry.teamName}
                </td>
                <td>{entry.matchesPlayed}</td>
                <td>{entry.wins}</td>
                <td>{entry.draws}</td>
                <td>{entry.losses}</td>
                <td>{entry.goalsFor}</td>
                <td>{entry.goalsAgainst}</td>
                <td>{entry.goalDifference}</td>
                <td style={{ fontWeight: "bold" }}>{entry.points}</td>
                <td><FormIndicator form={entry.recentForm} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 className="usa-heading" style={{ marginTop: "2rem" }}>Top Scorers</h2>
      <TopScorers />
    </section>
  );
}
