import { ImageResponse } from "next/og";

// Next auto-mounts app/opengraph-image.tsx as the site-wide OG image and
// emits the corresponding <meta property="og:image"> / twitter:image tags.
// 1200×630 is the canonical Open Graph size — LinkedIn, Twitter, Slack,
// Discord all crop/scale from that. Palette matches the site tokens so the
// share card feels like the site, not a generic template.
export const alt = "Nishanth Jadav — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 88px",
          background: "#f6f0e4",
          color: "#1d2c2a",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {/* Top row: a small "brand chip" that mirrors the site's ink/paper */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1d2c2a",
              color: "#f6f0e4",
              borderRadius: 12,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            nj
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#5a6b68",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            portfolio
          </div>
        </div>

        {/* Middle: the name, oversized. Line-height tight so it feels editorial */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.05,
          }}
        >
          <div style={{ display: "flex", fontSize: 108, fontWeight: 700, letterSpacing: "-0.04em" }}>
            Nishanth Jadav
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 32,
              color: "#5a6b68",
              letterSpacing: "-0.01em",
            }}
          >
            Software Engineer · CS + Math @ Villanova
          </div>
        </div>

        {/* Bottom hairline + small URL tag, evokes the site's border-hair look */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(29,44,42,0.18)",
            paddingTop: 24,
            fontSize: 22,
            color: "#5a6b68",
          }}
        >
          <div style={{ display: "flex" }}>projects · experience · interactive mode</div>
          <div style={{ display: "flex" }}>nishanthjadav.com</div>
        </div>
      </div>
    ),
    size,
  );
}
