const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data as T;
  } catch { return null; }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export interface ContentItem {
  contentId: string;
  title: string;
  summary: string;
  durationLabel: string;
  sourceUrl: string;
  sourceName: string;
  sourceCountry: string;
  contentType: string;
  publicationDate?: string;
}

export interface TransferItem {
  contentId: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  sourceCountry: string;
  transferType: string;
  publicationDate: string;
  durationLabel: string;
}

const PROXY = "https://arsenal-proxy.eyuelkt.workers.dev/rss?url=";

const RSS_SOURCES = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", name: "BBC Sport", country: "England", type: "news" },
  { url: "https://www.skysports.com/rss/12040", name: "Sky Sports", country: "England", type: "news" },
  { url: "https://www.theguardian.com/football/arsenal/rss", name: "The Guardian", country: "England", type: "news" },
  { url: "https://www.espn.com/espn/rss/soccer/news", name: "ESPN FC", country: "USA", type: "news" },
  { url: "https://arseblog.com/feed/", name: "Arseblog", country: "England", type: "blog" },
  { url: "https://www.justarsenal.com/feed", name: "Just Arsenal", country: "England", type: "blog" },
  { url: "https://paininthearsenal.com/feed", name: "Pain in the Arsenal", country: "England", type: "blog" },
  { url: "https://le-grove.co.uk/feed", name: "Le Grove", country: "England", type: "blog" },
  { url: "https://goonerdaily.com/feed", name: "Gooner Daily", country: "England", type: "blog" },
  { url: "https://arseblog.com/category/arsecast/feed/", name: "Arsecast", country: "England", type: "podcast" },
  { url: "https://feeds.feedburner.com/HandbrakeFc", name: "Handbrake FC", country: "England", type: "podcast" },
  { url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCmDTnDfLBnCMkRKFBgDbZsA", name: "Arsenal FC Official", country: "England", type: "video" },
  { url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC_dJLZU3fRb89B03cFHQVdA", name: "AFTV", country: "England", type: "video" },
  { url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCEFHn_bMcTkFkKhFpEFkWAw", name: "Arsenal Highlights", country: "England", type: "video" },
];

const TRANSFER_SOURCES = [
  { url: "https://www.skysports.com/rss/12040", name: "Sky Sports", country: "England" },
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", name: "BBC Sport", country: "England" },
  { url: "https://www.theguardian.com/football/transfers/rss", name: "The Guardian", country: "England" },
  { url: "https://arseblog.com/feed/", name: "Arseblog", country: "England" },
  { url: "https://paininthearsenal.com/feed", name: "Pain in the Arsenal", country: "England" },
  { url: "https://www.justarsenal.com/feed", name: "Just Arsenal", country: "England" },
  { url: "https://le-grove.co.uk/feed", name: "Le Grove", country: "England" },
];

const TRANSFER_KEYWORDS = ["transfer", "sign", "signing", "deal", "loan", "depart", "exit", "bid", "fee", "contract", "extension", "rumour", "rumor", "target", "move", "linked", "interest", "window", "summer", "january"];

function parseRSSDate(dateStr: string | null): string | undefined {
  if (!dateStr) return undefined;
  try { return new Date(dateStr).toISOString(); } catch { return undefined; }
}

function estimateDuration(text: string): string {
  const mins = Math.max(1, Math.round(text.split(/\s+/).length / 200));
  return `${mins} min read`;
}

function guessTransferType(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("loan")) return "loan";
  if (t.includes("depart") || t.includes("exit") || t.includes("leav") || t.includes("sold") || t.includes("release")) return "departure";
  if (t.includes("extension") || t.includes("renew")) return "contract_extension";
  if (t.includes("sign") || t.includes("complet") || t.includes("confirmed") || t.includes("official") || t.includes("done deal")) return "confirmed_signing";
  return "rumor";
}

async function fetchRSSItems(source: { url: string; name: string; country: string; type?: string }): Promise<any[]> {
  const res = await fetch(`${PROXY}${encodeURIComponent(source.url)}`);
  if (!res.ok) return [];
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");

  // Handle both RSS <item> and Atom <entry> (YouTube uses Atom)
  const items = Array.from(xml.querySelectorAll("item, entry"));

  return items.map((item, i) => {
    const title = item.querySelector("title")?.textContent?.trim() ?? "";
    // YouTube Atom feeds use <link href="..."> instead of <link>text</link>
    const link =
      item.querySelector("link")?.getAttribute("href") ||
      item.querySelector("link")?.textContent?.trim() ||
      "";
    const description =
      item.querySelector("description")?.textContent?.replace(/<[^>]+>/g, "").trim() ||
      item.querySelector("summary")?.textContent?.replace(/<[^>]+>/g, "").trim() ||
      item.querySelector("media\\:description")?.textContent?.trim() ||
      "";
    const pubDate =
      item.querySelector("pubDate")?.textContent ||
      item.querySelector("published")?.textContent ||
      item.querySelector("updated")?.textContent ||
      null;

    return { i, title, link, description, pubDate, source };
  });
}

export async function fetchArsenalNews(contentType?: string): Promise<ContentItem[]> {
  const cacheKey = `arsenal-news-${contentType ?? "all"}`;
  const cached = getCached<ContentItem[]>(cacheKey);
  if (cached) return cached;

  const sources = contentType ? RSS_SOURCES.filter(s => s.type === contentType) : RSS_SOURCES;
  const results = await Promise.allSettled(sources.map(fetchRSSItems));

  const items = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
    .flatMap(r => r.value)
    .filter(({ title, description, source }) => {
      // For video/podcast, include all items from Arsenal-specific channels
      if (source.type === "video" || source.type === "podcast") return true;
      // For news/blog, filter for Arsenal mentions
      return (title + description).toLowerCase().includes("arsenal");
    })
    .map(({ i, title, link, description, pubDate, source }) => ({
      contentId: `${source.name}-${i}-${Date.now()}`,
      title,
      summary: description.slice(0, 200) + (description.length > 200 ? "..." : ""),
      durationLabel: source.type === "video" ? "Video" : estimateDuration(description),
      sourceUrl: link,
      sourceName: source.name,
      sourceCountry: source.country,
      contentType: source.type ?? "news",
      publicationDate: parseRSSDate(pubDate),
    }))
    .sort((a, b) => {
      const dA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
      const dB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
      return dB - dA;
    });

  setCache(cacheKey, items);
  return items;
}

export async function fetchArsenalTransfers(): Promise<TransferItem[]> {
  const cacheKey = "arsenal-transfers";
  const cached = getCached<TransferItem[]>(cacheKey);
  if (cached) return cached;

  const results = await Promise.allSettled(TRANSFER_SOURCES.map(fetchRSSItems));
  const items = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
    .flatMap(r => r.value)
    .filter(({ title, description }) => {
      const combined = (title + description).toLowerCase();
      return combined.includes("arsenal") && TRANSFER_KEYWORDS.some(k => combined.includes(k));
    })
    .map(({ i, title, link, description, pubDate, source }) => ({
      contentId: `${source.name}-transfer-${i}-${Date.now()}`,
      title,
      summary: description.slice(0, 200) + (description.length > 200 ? "..." : ""),
      durationLabel: estimateDuration(description),
      sourceUrl: link,
      sourceName: source.name,
      sourceCountry: source.country,
      transferType: guessTransferType(title + description),
      publicationDate: parseRSSDate(pubDate) ?? new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());

  setCache(cacheKey, items);
  return items;
}