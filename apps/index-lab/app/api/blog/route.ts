const BLOG_RSS_URL = "https://blog.vmcsubastas.com/rss/";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  href: string;
  publishedAt: string;
};

export const revalidate = 300;

function stripCdata(value: string): string {
  return value.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1");
}

function decodeXml(value: string): string {
  return stripCdata(value.trim())
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(parseInt(decimal, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readTag(item: string, tag: string): string {
  const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseRss(xml: string): BlogPost[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  return items.slice(0, 6).flatMap((item, index) => {
    const title = readTag(item, "title");
    const excerpt = readTag(item, "description");
    const href = readTag(item, "link");
    const imageSrc = item.match(/<media:content[^>]*\surl="([^"]+)"/i)?.[1] ?? "";
    const publishedAt = readTag(item, "pubDate");

    if (!title || !href || !imageSrc) return [];
    return [{ id: `blog-${index}-${href}`, title, excerpt, imageSrc, href, publishedAt }];
  });
}

export async function GET(): Promise<Response> {
  try {
    const response = await fetch(BLOG_RSS_URL, {
      next: { revalidate },
      headers: { Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8" },
    });
    if (!response.ok) throw new Error(`RSS returned ${response.status}`);

    return Response.json({ posts: parseRss(await response.text()) }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return Response.json({ posts: [] }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
