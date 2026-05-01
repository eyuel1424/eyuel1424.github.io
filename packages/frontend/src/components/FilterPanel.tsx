import React from "react";
import { CONTENT_TYPES } from "@arsenal/shared";

interface FilterPanelProps {
  contentType: string;
  searchTerm: string;
  onContentTypeChange: (value: string) => void;
  onSearchTermChange: (value: string) => void;
}

export function FilterPanel({
  contentType,
  searchTerm,
  onContentTypeChange,
  onSearchTermChange,
}: FilterPanelProps) {
  return (
    <fieldset className="usa-fieldset filter-panel">
      <legend className="usa-sr-only">Filter content</legend>
      <div className="filter-type-row" role="group" aria-label="Content type filter">
        <button
          className={`filter-chip ${contentType === "" ? "filter-chip--active" : ""}`}
          onClick={() => onContentTypeChange("")}
          aria-pressed={contentType === ""}
          type="button"
        >
          All
        </button>
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            className={`filter-chip ${contentType === type ? "filter-chip--active" : ""}`}
            onClick={() => onContentTypeChange(type)}
            aria-pressed={contentType === type}
            type="button"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <div className="filter-search">
        <label className="usa-label" htmlFor="filter-search">Search</label>
        <input
          className="usa-input"
          id="filter-search"
          type="search"
          placeholder="Search articles, podcasts, blogs..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          aria-label="Search content"
        />
      </div>
    </fieldset>
  );
}
