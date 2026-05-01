import React, { useState, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

type AudioState = "idle" | "loading" | "ready" | "playing" | "error";

export function AudioSummary() {
  const [state, setState] = useState<AudioState>("idle");
  const [script, setScript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string>("");

  const loadAudio = async () => {
    setState("loading");
    setErrorMsg("");

    try {
      // Fetch the script text for display
      const scriptRes = await fetch(`${API_URL}/audio-summary/script`);
      if (scriptRes.ok) {
        const data = await scriptRes.json();
        setScript(data.script ?? "");
      }

      // Fetch the audio
      const audioRes = await fetch(`${API_URL}/audio-summary`);
      if (!audioRes.ok) {
        const err = await audioRes.json().catch(() => ({ error: "Audio generation failed" }));
        throw new Error(err.error ?? `HTTP ${audioRes.status}`);
      }

      const blob = await audioRes.blob();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = blobUrlRef.current;
        audioRef.current.load();
      }

      setState("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load audio");
      setState("error");
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setState("playing");
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState("ready");
    }
  };

  return (
    <section className="audio-summary" aria-label="Daily audio briefing">
      <div className="audio-summary__header">
        <span className="audio-summary__icon" aria-hidden="true">🎙️</span>
        <h3 className="audio-summary__title">Daily Audio Briefing</h3>
        <span className="audio-summary__badge">~30 sec</span>
      </div>

      <p className="audio-summary__desc">
        Listen to today's Arsenal news summary, powered by AI voice.
      </p>

      <div className="audio-summary__controls">
        {state === "idle" && (
          <button
            className="usa-button audio-summary__btn"
            onClick={loadAudio}
            type="button"
          >
            ▶ Generate Briefing
          </button>
        )}

        {state === "loading" && (
          <button className="usa-button audio-summary__btn" disabled type="button">
            <span className="audio-summary__spinner" aria-hidden="true" />
            Generating...
          </button>
        )}

        {state === "ready" && (
          <button
            className="usa-button audio-summary__btn"
            onClick={handlePlay}
            type="button"
          >
            ▶ Play Briefing
          </button>
        )}

        {state === "playing" && (
          <button
            className="usa-button audio-summary__btn audio-summary__btn--playing"
            onClick={handlePause}
            type="button"
          >
            ⏸ Pause
          </button>
        )}

        {state === "error" && (
          <div>
            <p className="usa-error-message" role="alert">{errorMsg}</p>
            <button
              className="usa-button audio-summary__btn"
              onClick={loadAudio}
              type="button"
            >
              ↻ Retry
            </button>
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        onEnded={() => setState("ready")}
        onError={() => { setState("error"); setErrorMsg("Audio playback failed"); }}
        preload="none"
        aria-label="Arsenal daily audio briefing"
      />

      {script && state !== "idle" && (
        <details className="audio-summary__transcript">
          <summary>View transcript</summary>
          <p>{script}</p>
        </details>
      )}
    </section>
  );
}
