import React, { useEffect, useState } from "react";
import { fetchArsenalNews, ContentItem } from "../services/newsService";

const INJURY_KEYWORDS = ["injury", "injured", "out", "doubtful", "fitness", "muscle", "hamstring", "knock", "strain", "fracture", "surgery", "ruled out", "unavailable", "return", "recovery", "ankle", "knee", "thigh", "calf", "shoulder", "back"];

const STATUS_COLORS: Record<string, string> = {
  "Out": "#EF0107",
  "Doubtful": "#9C824A",
  "Return": "#2E8540",
};

function getStatus(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("ruled out") || t.includes("out for") || t.includes("surgery") || t.includes("fracture")) return "Out";
  if (t.includes("doubtful") || t.includes("fitness") || t.includes("knock") || t.includes("strain")) return "Doubtful";
  if (t.includes("return") || t.includes("back in training") || t.includes("recovered")) return "Return";
  return "Doubtful";
}

export function InjuryReport() {
  const [injuries, setInjuries] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArsenalNews()
      .then(articles => {
        const injuryArticles = articles.filter(article => {
          const text = (article.title + " " + article.summary).toLowerCase();
          return INJURY_KEYWORDS.some(k => text.includes(k));
        }).slice(0, 6);
        setInjuries(injuryArticles);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ marginTop: "1rem" }}>Loading injury report...</p>;

  if (injuries.length === 0) return (
    <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#1e3a5f", borderRadius: "8px" }}>
      <h3 style={{ margin: 0 }}>Injury Report</h3>
      <p style={{ color: "#9CA3AF", margin: "0.5rem 0 0 0" }}>No injury news found. Full squad may be available!</p>
    </div>
  );

  return (
    <section style={{ marginTop: "1.5rem" }} aria-label="Injury report">
      <h3 style={{ borderBottom: "2px solid #EF0107", paddingBottom: "0.5rem" }}>Injury Report</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {injuries.map((article) => {
          const status = getStatus(article.title + " " + article.summary);
          return (
            <div key={article.contentId} style={{ background: "#1e3a5f", borderRadius: "8px", padding: "0.75rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="usa-link"
                  style={{ fontWeight: "bold", fontSize: "0.95rem" }}
                >
                  {article.title}
                </a>
                <span style={{
                  background: STATUS_COLORS[status],
                  color: "white",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}>
                  {status}
                </span>
              </div>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#9CA3AF" }}>
                {article.sourceName} · {article.publicationDate ? new Date(article.publicationDate).toLocaleDateString() : ""}
              </p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "0.75rem" }}>
        Injury updates sourced from BBC Sport, Sky Sports, Guardian and Arsenal blogs.
      </p>
    </section>
  );
}