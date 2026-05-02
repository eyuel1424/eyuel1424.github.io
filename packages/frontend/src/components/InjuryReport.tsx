import React from "react";

export function InjuryReport() {
  return (
    <div className="usa-alert usa-alert--info" style={{ marginTop: "1.5rem" }}>
      <div className="usa-alert__body">
        <h3 className="usa-alert__heading">Injury Report</h3>
        <p className="usa-alert__text">
          Injury updates coming soon. Check <a href="https://www.arsenal.com/news" target="_blank" rel="noopener noreferrer" className="usa-link">arsenal.com</a> for the latest squad news.
        </p>
      </div>
    </div>
  );
}
