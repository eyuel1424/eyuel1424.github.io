import React, { useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setMessage("Please enter a valid email."); setStatus("error"); return; }
    setStatus("loading");
    try {
      const res = await fetch("https://arsenal-proxy.eyuelkt.workers.dev/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStatus("success"); setMessage("Subscribed! Check your inbox."); setEmail(""); }
      else { setStatus("error"); setMessage(data.error ?? "Something went wrong."); }
    } catch { setStatus("error"); setMessage("Network error. Please try again."); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={status === "loading" || status === "success"}
        style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #1e3a5f", background: "#0d1b2a", color: "white", fontSize: "0.9rem", minWidth: "200px" }}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        style={{ padding: "0.5rem 1.25rem", background: "#EF0107", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed!" : "Subscribe"}
      </button>
      {message && (
        <p style={{ width: "100%", margin: "0.25rem 0 0 0", fontSize: "0.82rem", color: status === "success" ? "#2E8540" : "#EF0107" }}>{message}</p>
      )}
    </form>
  );
}