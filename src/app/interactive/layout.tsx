import type { Metadata } from "next";

// The interactive route's page.tsx is a client component ("use client"), so
// it can't export metadata itself. This colocated layout is a server file
// and owns the SEO/social metadata for /interactive.
export const metadata: Metadata = {
  title: "Interactive Mode",
  description:
    "nishOS — a retro Windows-style desktop rendition of Nishanth Jadav's portfolio. Draggable icons, a Recycle Bin, wallpapers, and a boot sequence.",
  openGraph: {
    title: "Interactive Mode · Nishanth Jadav",
    description:
      "nishOS — a retro Windows-style desktop rendition of Nishanth Jadav's portfolio.",
    url: "/interactive",
    type: "website",
  },
  alternates: { canonical: "/interactive" },
};

export default function InteractiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
