export async function fetchCryptoNews(topic: string): Promise<string> {
  const RSS_FEEDS = [
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://cointelegraph.com/rss",
    "https://decrypt.co/feed",
  ];

  const keywords = topic.toLowerCase().split(" ");

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "InkGate/1.0" },
      });

      if (!res.ok) continue;

      const xml = await res.text();

      // Parse RSS items
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

      const relevant = items
        .map((item) => {
          const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ??
            item.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
          const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ??
            item.match(/<description>(.*?)<\/description>/)?.[1] ?? "";
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? "";

          return { title, description: description.replace(/<[^>]*>/g, "").slice(0, 200), pubDate, link };
        })
        .filter((item) =>
          keywords.some(
            (k) =>
              k.length > 3 &&
              (item.title.toLowerCase().includes(k) ||
                item.description.toLowerCase().includes(k))
          )
        )
        .slice(0, 3);

      if (relevant.length > 0) {
        return (
          "Latest crypto news (" + new Date().toLocaleDateString() + "):\n" +
          relevant
            .map((item, i) =>
              (i + 1) + ". " + item.title + (item.pubDate ? " (" + item.pubDate + ")" : "") + "\n   " + item.description
            )
            .join("\n\n")
        );
      }
    } catch {
      continue;
    }
  }

  return "";
}