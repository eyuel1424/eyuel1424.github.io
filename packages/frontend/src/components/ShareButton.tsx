import React, { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareToX = () => {
    const text = encodeURIComponent(`${title} ${url}`);
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank", "noopener");
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${title} ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <div className="share-buttons" role="group" aria-label="Share this article">
      <button
        className="share-btn share-btn--x"
        onClick={shareToX}
        aria-label="Share on X"
        title="Share on X"
        type="button"
      >
        𝕏
      </button>
      <button
        className="share-btn share-btn--wa"
        onClick={shareToWhatsApp}
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        type="button"
      >
        💬
      </button>
      <button
        className="share-btn share-btn--copy"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Copied!" : "Copy link"}
        type="button"
      >
        {copied ? "✓" : "🔗"}
      </button>
    </div>
  );
}
