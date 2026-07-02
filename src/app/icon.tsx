import { ImageResponse } from "next/og";

// Next auto-mounts app/icon.tsx as /favicon and emits a <link rel="icon">
// pointing to it. 32×32 is the standard tab-icon size — browsers scale down
// as needed. Palette matches the site's `--color-paper`/`--color-ink` tokens
// so the tab reads as part of the design instead of a system default.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d2c2a",
          color: "#f6f0e4",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          borderRadius: 6,
        }}
      >
        nj
      </div>
    ),
    size,
  );
}
