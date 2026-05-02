import React from "react";

export function AudioSummary() {
  return (
    <section className="audio-summary" aria-label="Daily audio briefing">
      <div className="audio-summary__header">
        <span className="audio-summary__icon" aria-hidden="true">mic</span>
        <h3 className="audio-summary__title">Daily Audio Briefing</h3>
        <span className="audio-summary__badge">~30 sec</span>
      </div>
      <p className="audio-summary__desc">
        Listen to today's Arsenal news summary, powered by AI voice.
      </p>
      <div className="audio-summary__controls">
        <p style={{ color: "#9CA3AF", fontStyle: "italic" }}>
          Audio briefing coming soon.
        </p>
      </div>
    </section>
  );
}

