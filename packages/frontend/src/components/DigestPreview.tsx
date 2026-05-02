import React from "react";
import { SubscribeForm } from "./SubscribeForm";

export function DigestPreview() {
  return (
    <section aria-label="Daily digest preview">
      <h2 className="usa-heading">Daily Digest Preview</h2>
      <div className="digest-cta">
        <div className="digest-cta__text">
          <h3 className="digest-cta__title">mail Get this in your inbox every morning</h3>
          <p className="digest-cta__desc">Subscribe to receive the Arsenal Daily Digest at 9:00 AM EST. Free, no spam, unsubscribe anytime.</p>
        </div>
        <SubscribeForm />
      </div>
      <div className="usa-alert usa-alert--info" style={{ marginTop: "2rem" }}>
        <div className="usa-alert__body">
          <h3 className="usa-alert__heading">Digest Preview Coming Soon</h3>
          <p className="usa-alert__text">
            The daily email digest feature is currently being set up. Subscribe above and you'll be notified as soon as it launches!
          </p>
        </div>
      </div>
    </section>
  );
}

