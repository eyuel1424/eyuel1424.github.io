import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface H2HData {
  opponent: string;
  allTime: string;
  lastMeeting: string;
  arsenalWinPct: string;
  funFact: string;
}

interface HeadToHeadProps {
  opponent: string;
}

export function HeadToHead({ opponent }: HeadToHeadProps) {
  const [data, setData] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opponent) return;
    setLoading(true);
    const fetchH2H = async () => {
      try {
        const response = await fetch(`${API_URL}/head-to-head/${encodeURIComponent(opponent)}`);
        if (!response.ok) return;
        setData(await response.json());
      } catch {
        // Graceful degradation
      } finally {
        setLoading(false);
      }
    };
    fetchH2H();
  }, [opponent]);

  if (loading || !data) return null;
  if (data.allTime === "No data available") return null;

  return (
    <div className="h2h" aria-label={`Head to head: Arsenal vs ${data.opponent}`}>
      <div className="h2h__header">
        <span className="h2h__icon" aria-hidden="true">⚔️</span>
        <strong>Arsenal vs {data.opponent}</strong>
      </div>
      <div className="h2h__stats">
        <div className="h2h__stat">
          <span className="h2h__label">All-time record</span>
          <span className="h2h__value">{data.allTime}</span>
        </div>
        <div className="h2h__stat">
          <span className="h2h__label">Arsenal win %</span>
          <span className="h2h__value">{data.arsenalWinPct}</span>
        </div>
        <div className="h2h__stat">
          <span className="h2h__label">Last meeting</span>
          <span className="h2h__value">{data.lastMeeting}</span>
        </div>
      </div>
      <p className="h2h__fact">💡 {data.funFact}</p>
    </div>
  );
}
