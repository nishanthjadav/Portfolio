import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

// Base URL for absolute metadata (og:image, canonicals, sitemap). Vercel sets
// `VERCEL_URL` per deployment (preview + production); `NEXT_PUBLIC_SITE_URL`
// wins if you've pinned a canonical prod domain via the env var in Vercel.
// Falls back to localhost for `next dev` so Metadata.metadataBase never warns.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Per-page `metadata.title` fills the %s slot; root pages use the default.
    default: "Nishanth Jadav",
    template: "%s · Nishanth Jadav",
  },
  description:
    "Portfolio of Nishanth Jadav — Software Engineer studying CS + Math at Villanova. Projects, experience, and a retro-desktop interactive mode.",
  applicationName: "Nishanth Jadav — Portfolio",
  authors: [{ name: "Nishanth Jadav" }],
  creator: "Nishanth Jadav",
  keywords: [
    "Nishanth Jadav",
    "software engineer",
    "portfolio",
    "Villanova",
    "computer science",
    "SAP",
    "Next.js",
    "React",
    "TypeScript",
  ],
  // Let search engines index everything; also unblocks the default sitemap.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "Nishanth Jadav",
    title: "Nishanth Jadav — Software Engineer",
    description:
      "Portfolio of Nishanth Jadav — Software Engineer studying CS + Math at Villanova.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    // Big-image card so the auto-generated opengraph-image.tsx gets used at
    // its full width instead of the tiny "summary" thumbnail.
    card: "summary_large_image",
    title: "Nishanth Jadav — Software Engineer",
    description:
      "Portfolio of Nishanth Jadav — Software Engineer studying CS + Math at Villanova.",
  },
};

// `viewport` is its own export in App Router (moved out of `metadata` in
// Next 14). `themeColor` matches the paper background so mobile browser
// chrome tints to match the site instead of contrasting against it.
export const viewport: Viewport = {
  themeColor: "#f6f0e4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plexMono.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
