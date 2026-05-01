import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface Injury {
  player: string;
  status: "Out" | "Doubtful" | "Available";
  detail: string;
  returnDate: string;
}

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  Out: { bg: "#EF0107", label: "Out" },
  Doubtful: { bg: "#9C824A", label: "Doubtful" },
  Available: { bg: "#2E8540", label: "Available" },
};

export function InjuryReport() {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInjuries = async () => {
      try {
        const response = await fetch(`${API_URL}/injuries`);
        if (!response.ok) return;
        const data = await response.json();
        setInjuries(data.injuries ?? []);
      } catch {
        // Graceful degradation
      } finally {
        setLoading(false);
      }
    };
    fetchInjuries();
  }, []);

  if (loading) return null;
  if (injuries.length === 0) return <p>No injury updates.</p>;

  const activeInjuries = injuries.filter(i => i.status !== "Available");
  const returning = injuries.filter(i => i.status === "Available");

  return (
    <section className="injury-report" aria-label="Injury report">
      <h3 className="injury-report__title">🏥 Injury Report</h3>
      <div className="injury-report__list">
        {activeInjuries.map((inj) => {
          const style = STATUS_STYLES[inj.status] ?? STATUS_STYLES.Out;
          return (
            <div key={inj.player} className="injury-report__item">
              <div className="injury-report__header">
                <strong className="injury-report__player">{inj.player}</strong>
                <span
                  className="injury-report__status"
                  style={{ backgroundColor: style.bg }}
                >
                  {style.label}
                </span>
              </div>
              <p className="injury-report__detail">{inj.detail}</p>
              <p className="injury-report__return">Expected return: {inj.returnDate}</p>
            </div>
          );
        })}
      </div>
      {returning.length > 0 && (
        <div className="injury-report__returning">
          <h4>Back in Training</h4>
          {returning.map((inj) => (
            <div key={inj.player} className="injury-report__item injury-report__item--available">
              <strong>{inj.player}</strong>
              <span className="injury-report__status" style={{ backgroundColor: "#2E8540" }}>
                Available
              </span>
              <p className="injury-report__detail">{inj.detail}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
