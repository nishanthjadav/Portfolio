import type { MetadataRoute } from "next";

// Same env-var fallback ladder as layout.tsx's metadataBase. `robots.txt`
// needs an absolute URL for `sitemap` (bots don't resolve relative paths).
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
