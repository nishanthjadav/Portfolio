import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// `lastModified` intentionally uses build time (not `new Date()` at request
// time) so search engines see a stable date until the next deploy. The three
// routes below match the app's real navigation — landing, portfolio,
// interactive. Priority is a hint, not a directive.
const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: BUILD_TIME,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: BUILD_TIME,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/interactive`,
      lastModified: BUILD_TIME,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
