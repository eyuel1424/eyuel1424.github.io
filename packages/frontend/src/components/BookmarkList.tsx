import React, { useEffect, useState } from "react";

interface BookmarkedArticle {
  contentId: string;
  title: string;
  sourceUrl: string;
  sourceName: string;
  publicationDate?: string;
}

function getBookmarks(): BookmarkedArticle[] {
  try {
    const stored = localStorage.getItem("arsenal-bookmarks");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function BookmarkList() {
  const [items, setItems] = useState<BookmarkedArticle[]>([]);

  useEffect(() => {
    setItems(getBookmarks());
  }, []);

  return (
    <section aria-label="Saved articles">
      <h2 className="usa-heading">Saved Articles</h2>
      {items.length === 0 && (
        <p>No saved articles yet. Use the bookmark icon on any article to save it here.</p>
      )}
      <ul className="usa-list usa-list--unstyled">
        {items.map((item) => (
          <li key={item.contentId} className="usa-card__container margin-bottom-2">
            <div className="usa-card__body">
              <h3>
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="usa-link">
                  {item.title}
                </a>
              </h3>
              <p className="text-base-dark font-sans-3xs">{item.sourceName}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
