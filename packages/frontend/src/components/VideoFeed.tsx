import React, { useEffect, useState } from "react";

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  published: string;
  channel: string;
}

const PROXY = "https://arsenal-proxy.eyuelkt.workers.dev/rss?url=";
const CHANNELS = [
  { id: "UCpryVRk_VDudG8SHXgWcG0w", name: "Arsenal FC Official" },
  { id: "UCBTy8j2cPy6zw68godcE7MQ", name: "AFTV" },
];

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function VideoFeed() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cached = localStorage.getItem("arsenal-videos");
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        setVideos(data);
        setLoading(false);
        return;
      }
    }

    Promise.allSettled(
      CHANNELS.map(ch =>
        fetch(`${PROXY}${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`)}`)
          .then(r => r.text())
          .then(text => {
            const xml = new DOMParser().parseFromString(text, "text/xml");
            const entries = Array.from(xml.querySelectorAll("entry"));
            return entries.slice(0, 8).map(entry => {
              const videoId = entry.querySelector("videoId")?.textContent || entry.querySelector("id")?.textContent?.split(":").pop() || "";
              return {
                id: videoId,
                title: entry.querySelector("title")?.textContent ?? "",
                youtubeId: videoId,
                description: entry.querySelector("description")?.textContent?.slice(0, 120) ?? "",
                published: entry.querySelector("published")?.textContent ?? "",
                channel: ch.name,
              };
            });
          })
          .catch(() => [])
      )
    ).then(results => {
      const all = results
        .filter((r): r is PromiseFulfilledResult<VideoItem[]> => r.status === "fulfilled")
        .flatMap(r => r.value)
        .filter(v => v.youtubeId)
        .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
      setVideos(all);
      localStorage.setItem("arsenal-videos", JSON.stringify({ data: all, timestamp: Date.now() }));
      setLoading(false);
    });
  }, []);

  return (
    <section aria-label="Arsenal videos" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "3px solid #EF0107", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
        Arsenal Videos
      </h2>
      {loading && <p style={{ color: "#9CA3AF" }}>Loading latest Arsenal videos...</p>}
      {error && <p style={{ color: "#EF0107" }}>{error}</p>}
      {!loading && videos.length === 0 && (
        <p style={{ color: "#9CA3AF" }}>No videos found. Check back soon!</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {videos.map((video) => (
          <div key={video.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {activeVideo === video.id ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                />
              </div>
            ) : (
              <div onClick={() => setActiveVideo(video.id)} style={{ position: "relative", paddingBottom: "56.25%", height: 0, cursor: "pointer", background: "#0d1b2a" }}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "64px", height: "64px", background: "rgba(239,1,7,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
                <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(0,0,0,0.7)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.7rem", color: "white" }}>
                  {video.channel}
                </div>
              </div>
            )}
            <div style={{ padding: "0.85rem 1rem" }}>
              <p style={{ margin: "0 0 0.3rem 0", fontWeight: "600", fontSize: "0.95rem", lineHeight: "1.4" }}>{video.title}</p>
              {video.description && <p style={{ margin: "0 0 0.3rem 0", fontSize: "0.82rem", color: "#9CA3AF" }}>{video.description}</p>}
              <span style={{ fontSize: "0.72rem", color: "#64748B" }}>{video.channel} · {video.published ? timeAgo(video.published) : ""}</span>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "1rem" }}>
        Videos auto-refreshed every 30 minutes from Arsenal FC Official and AFTV. Click to play inline.
      </p>
    </section>
  );
}