import React from "react";
import { NavLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="not-found" aria-label="Page not found">
      <div className="not-found__content">
        <span className="not-found__icon" aria-hidden="true">⚽</span>
        <h2 className="not-found__title">Offside!</h2>
        <p className="not-found__text">
          The page you're looking for doesn't exist. Maybe it got transferred.
        </p>
        <NavLink to="/" className="usa-button not-found__btn">
          Back to News
        </NavLink>
      </div>
    </section>
  );
}
