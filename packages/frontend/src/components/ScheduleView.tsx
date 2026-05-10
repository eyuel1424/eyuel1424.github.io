import React, { useEffect, useState, useRef } from "react";
import { fetchArsenalFixtures, fetchArsenalResults, Match } from "../services/footballService";
import { InjuryReport } from "./InjuryReport";

// ─────────────────────────────────────────────
// LIVE COMMENTARY
// ─────────────────────────────────────────────

interface CommentaryEvent {
  minute: number | null;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "kick_off" | "half_time" | "full_time" | "info";
  text: string;
  timestamp: number;
}

interface LiveMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  minute?: number;
}

const EVENT_ICONS: Record<CommentaryEvent["type"], string> = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔄",
  kick_off: "🏁",
  half_time: "☕",
  full_time: "🏆",
  info: "📋",
};

const PROXY_BASE = "https://arsenal-proxy.eyuelkt.workers.dev";
const POLL_INTERVAL = 30_000;

function mapEventType(type: string): CommentaryEvent["type"] {
  const t = (type ?? "").toLowerCase();
  if (t.includes("goal")) return "goal";
  if (t.includes("yellow")) return "yellow_card";
  if (t.includes("red")) return "red_card";
  if (t.includes("sub")) return "substitution";
  return "info";
}

function mapStatusToEvent(status: string): CommentaryEvent["type"] {
  if (status === "IN_PLAY") return "kick_off";
  if (status === "PAUSED") return "half_time";
  if (status === "FINISHED") return "full_time";
  return "info";
}

function buildStatusText(m: LiveMatch): string {
  if (m.status === "IN_PLAY") return `Match underway — ${m.homeTeam} vs ${m.awayTeam}`;
  if (m.status === "PAUSED") return `Half time — ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`;
  if (m.status === "FINISHED") return `Full time — ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`;
  return `${m.homeTeam} vs ${m.awayTeam}`;
}

function buildEventText(e: any): string {
  const min = e.minute ? `${e.minute}'` : "";
  const player = e.player?.name || e.playerName || "";
  const team = e.team?.shortName || e.team?.name || "";
  if (e.type?.toLowerCase().includes("goal")) return `${min} ⚽ GOAL! ${player} (${team})`.trim();
  if (e.type?.toLowerCase().includes("yellow")) return `${min} 🟨 Yellow card — ${player} (${team})`.trim();
  if (e.type?.toLowerCase().includes("red")) return `${min} 🟥 Red card — ${player} (${team})`.trim();
  if (e.type?.toLowerCase().includes("sub")) return `${min} 🔄 Sub: ${player} (${team})`.trim();
  return `${min} ${player} ${team}`.trim();
}

function LiveCommentary() {
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [events, setEvents] = useState<CommentaryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const prevScoreRef = useRef<string>("");
  const feedRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<CommentaryEvent[]>([]);

  eventsRef.current = events;

  async function fetchLiveMatch() {
    try {
      const res = await fetch(`${PROXY_BASE}/live`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (data.match) {
        const m: LiveMatch = {
          homeTeam: data.match.homeTeam?.shortName || data.match.homeTeam?.name || "Home",
          awayTeam: data.match.awayTeam?.shortName || data.match.awayTeam?.name || "Away",
          homeScore: data.match.score?.fullTime?.home ?? data.match.score?.halfTime?.home ?? 0,
          awayScore: data.match.score?.fullTime?.away ?? data.match.score?.halfTime?.away ?? 0,
          status: data.match.status,
          minute: data.match.minute,
        };

        const scoreKey = `${m.homeScore}-${m.awayScore}`;
        if (prevScoreRef.current && prevScoreRef.current !== scoreKey) {
          const [prevH, prevA] = prevScoreRef.current.split("-").map(Number);
          const scoringTeam = m.homeScore > prevH ? m.homeTeam : m.awayTeam;
          const isArsenal = scoringTeam.toLowerCase().includes("arsenal");
          const goalEvent: CommentaryEvent = {
            minute: m.minute ?? null,
            type: "goal",
            text: `${isArsenal ? "🔴 ARSENAL" : scoringTeam} GOAL! ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`,
            timestamp: Date.now(),
          };
          setEvents(prev => [goalEvent, ...prev].slice(0, 50));
          setTimeout(() => feedRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
        }
        prevScoreRef.current = scoreKey;
        setMatch(m);

        if (data.events?.length) {
          const mapped: CommentaryEvent[] = data.events.map((e: any) => ({
            minute: e.minute ?? null,
            type: mapEventType(e.type),
            text: buildEventText(e),
            timestamp: Date.now(),
          }));
          setEvents(mapped.reverse());
        } else if (eventsRef.current.length === 0) {
          const seed: CommentaryEvent = {
            minute: m.minute ?? null,
            type: mapStatusToEvent(m.status),
            text: buildStatusText(m),
            timestamp: Date.now(),
          };
          setEvents([seed]);
        }
      } else {
        setMatch(null);
      }

      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Could not load live data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLiveMatch();
    const interval = setInterval(fetchLiveMatch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading || !match) return null;

  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";

  return (
    <div className={`live-commentary${isLive ? " live-commentary--active" : ""}`}>
      <div className="live-commentary__header">
        <div className="live-badge-row">
          {isLive && <span className="live-badge">● LIVE</span>}
          {match.minute != null && <span className="live-minute">{match.minute}'</span>}
        </div>
        <h3 className="live-commentary__title">Match Commentary</h3>
        {lastUpdated && (
          <span className="live-updated">
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="live-scoreboard">
        <span className={`live-team${match.homeTeam.toLowerCase().includes("arsenal") ? " live-team--arsenal" : ""}`}>
          {match.homeTeam}
        </span>
        <span className="live-score">{match.homeScore} — {match.awayScore}</span>
        <span className={`live-team${match.awayTeam.toLowerCase().includes("arsenal") ? " live-team--arsenal" : ""}`}>
          {match.awayTeam}
        </span>
      </div>

      {events.length > 0 && (
        <div className="live-feed" ref={feedRef}>
          {events.map((event, i) => (
            <div key={`${event.timestamp}-${i}`} className={`live-event live-event--${event.type}`}>
              <span className="live-event__icon">{EVENT_ICONS[event.type]}</span>
              <span className="live-event__text">{event.text}</span>
              {event.minute != null && (
                <span className="live-event__minute">{event.minute}'</span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="live-error">{error} — retrying…</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// SCHEDULE VIEW (original — unchanged)
// ─────────────────────────────────────────────

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
  return name.replace(" FC", "").replace(" United", " Utd").replace("Club Atletico de Madrid", "Atletico Madrid").replace("Club Atlético de Madrid", "Atletico Madrid");
}

function getMatchFact(opponent: string, competition: string): string {
  const facts: Record<string, string> = {
    "Atletico": "Arsenal have never lost to Atletico Madrid at the Emirates Stadium.",
    "West Ham": "Arsenal have won their last 4 Premier League meetings against West Ham.",
    "Burnley": "Arsenal have scored in each of their last 8 games against Burnley.",
    "Crystal Palace": "Arsenal won the reverse fixture 5-0 at Selhurst Park this season.",
    "Manchester City": "Title-deciding fixture — Arsenal lead City by 5 points.",
    "Chelsea": "London derby — Arsenal have won 3 of the last 4 against Chelsea.",
    "Liverpool": "Two title contenders clash — one of the biggest games of the season.",
    "Tottenham": "North London Derby — Arsenal have won the last 3 meetings.",
    "Bournemouth": "Arsenal have scored 3+ goals in their last 3 meetings with Bournemouth.",
    "Brentford": "Arsenal are unbeaten in their last 5 games against Brentford.",
    "Newcastle": "Arsenal beat Newcastle 1-0 in the reverse fixture at St James Park.",
    "Aston Villa": "Arsenal vs Villa — a clash between two of the Premier League's best attacks.",
    "Fulham": "Arsenal demolished Fulham 3-0 earlier this season.",
    "Everton": "Arsenal have kept a clean sheet in 4 of their last 5 games against Everton.",
  };
  for (const [key, fact] of Object.entries(facts)) {
    if (opponent.includes(key)) return fact;
  }
  if (competition.includes("Champions League")) return "Arsenal are chasing their first ever Champions League title!";
  return "Arsenal are 6 points clear at the top — form of their lives!";
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
    <section aria-label="Schedule and results" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "3px solid #EF0107", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
        Schedule & Results
      </h2>

      {/* ── LIVE COMMENTARY — renders only when a match is live ── */}
      <LiveCommentary />

      {results.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "1rem" }}>Recent Results</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.85rem" }}>
            {results.map((r) => {
              const resultKey = r.result as "W" | "D" | "L" | undefined;
              const rs = resultKey ? RESULT_COLORS[resultKey] : RESULT_COLORS.D;
              const isHome = r.homeTeam.includes("Arsenal");
              const opponent = shortName(isHome ? r.awayTeam : r.homeTeam);
              return (
                <div key={r.matchId} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1rem", textAlign: "center", borderTop: `3px solid ${rs.bg}`, backdropFilter: "blur(4px)" }}>
                  <span style={{ background: rs.bg, color: "white", padding: "3px 14px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "800", display: "inline-block", marginBottom: "0.6rem", letterSpacing: "0.05em" }}>{rs.label}</span>
                  <p style={{ margin: "0 0 0.2rem 0", fontSize: "0.8rem", color: "#9CA3AF" }}>{isHome ? "Arsenal" : opponent}</p>
                  <p style={{ margin: "0 0 0.2rem 0", fontSize: "1.5rem", fontWeight: "900", color: "white", letterSpacing: "0.1em" }}>{r.homeScore} - {r.awayScore}</p>
                  <p style={{ margin: "0 0 0.3rem 0", fontSize: "0.8rem", color: "#9CA3AF" }}>{isHome ? opponent : "Arsenal"}</p>
                  <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.7rem", color: "#64748B" }}>
                    {r.competition.replace("UEFA ", "").replace("Premier League", "PL")} · {new Date(r.kickoffTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "1rem" }}>Upcoming Matches</h3>
        {loading && <p>Loading fixtures...</p>}
        {!loading && fixtures.length === 0 && <p style={{ color: "#9CA3AF" }}>No upcoming matches scheduled.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {fixtures.map((match, idx) => {
            const isHome = match.homeTeam.includes("Arsenal");
            const opponent = shortName(isHome ? match.awayTeam : match.homeTeam);
            const highlight = isWithin24Hours(match.kickoffTime);
            const isNext = idx === 0;
            const fact = isNext ? getMatchFact(opponent, match.competition) : null;
            return (
              <div key={match.matchId} style={{ borderRadius: "12px", padding: "1.1rem 1.5rem", borderLeft: highlight ? "4px solid #F59E0B" : isNext ? "4px solid #60a5fa" : "4px solid #EF0107", background: isNext ? "linear-gradient(135deg, rgba(30,58,95,0.8), rgba(45,95,166,0.4))" : "rgba(255,255,255,0.03)", boxShadow: isNext ? "0 4px 20px rgba(96,165,250,0.1)" : "none", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    {isNext && <span style={{ fontSize: "0.68rem", color: "#60a5fa", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: "0.35rem" }}>Next Match</span>}
                    {highlight && <span style={{ fontSize: "0.68rem", color: "#F59E0B", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: "0.35rem" }}>Today!</span>}
                    <p style={{ margin: 0, fontWeight: "800", fontSize: "1.05rem", letterSpacing: "0.01em" }}>
                      Arsenal {isHome ? "vs" : "@"} {opponent}
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.72rem", color: "#9CA3AF", fontWeight: "400" }}>({isHome ? "Home" : "Away"})</span>
                    </p>
                    <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>{match.competition.replace("UEFA ", "")}</p>
                    {fact && <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.78rem", color: "#60a5fa", fontStyle: "italic", lineHeight: "1.4" }}>💡 {fact}</p>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontWeight: "700", fontSize: "0.95rem", color: highlight ? "#F59E0B" : isNext ? "#60a5fa" : "inherit" }}>{formatDate(match.kickoffTime)}</p>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#9CA3AF" }}>{formatTime(match.kickoffTime)}</p>
                  </div>
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