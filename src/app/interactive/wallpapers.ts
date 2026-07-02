/**
 * Wallpaper catalog for nishOS. Every wallpaper is a CSS `background` string
 * (or comma-separated stack of layers) so we ship zero image assets — the
 * whole set is generated from gradients + a couple of inline SVG data URIs.
 *
 * A separate `pattern` layer overlays a low-opacity repeating grid of retro
 * glyphs (4-pane flag, floppy, monitor). It's applied on top of whichever
 * wallpaper the user picks so the desktop never feels featureless.
 */

export type Wallpaper = {
  id: string;
  label: string;
  /** CSS `background` shorthand — can be a gradient stack or solid color. */
  background: string;
  /** Muted text color for icon labels? Some light wallpapers need dark labels. */
  labelColor?: "light" | "dark";
};

// A small SVG rendered inline as a repeating tile, low-opacity, sitting on
// top of the wallpaper. The pattern is intentionally sparse so it reads as
// "retro flourish" rather than "busy background."
const OVERLAY_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>
  <g fill='white' fill-opacity='0.08'>
    <g transform='translate(16 20) skewX(-14)'>
      <rect x='0' y='0' width='7' height='7'/>
      <rect x='9' y='0' width='7' height='7'/>
      <rect x='0' y='9' width='7' height='7'/>
      <rect x='9' y='9' width='7' height='7'/>
    </g>
    <g transform='translate(96 24)'>
      <rect x='0' y='0' width='18' height='18' rx='1.5'/>
      <rect x='3' y='0' width='12' height='6' fill='rgba(0,0,0,0.35)'/>
      <rect x='5' y='1' width='2' height='4' fill='white'/>
      <rect x='3' y='10' width='12' height='6' fill='rgba(0,0,0,0.15)'/>
    </g>
    <g transform='translate(24 100)'>
      <rect x='0' y='0' width='20' height='14' rx='1'/>
      <rect x='2' y='2' width='16' height='9' fill='rgba(0,0,0,0.35)'/>
      <rect x='7' y='15' width='6' height='2'/>
      <rect x='4' y='17' width='12' height='1.5'/>
    </g>
    <g transform='translate(108 104)'>
      <path d='M0 0 L0 14 L4 10 L7 16 L9 15 L6 9 L11 9 Z'/>
    </g>
  </g>
</svg>`.trim();

// URL-encode once, at module load. `encodeURIComponent` handles `#` etc.
export const OVERLAY_PATTERN_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(OVERLAY_SVG)}")`;

// Rolling-hills SVG used by the "Hills" wallpaper. Two overlapping green
// silhouettes over the sky gradient — evokes the XP Bliss photograph without
// shipping the actual image.
const HILLS_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMax slice'>
  <path d='M0 720 Q 400 560 800 660 T 1600 620 L 1600 900 L 0 900 Z' fill='#4a9c2e'/>
  <path d='M0 780 Q 500 640 1000 720 T 1600 700 L 1600 900 L 0 900 Z' fill='#6db33f'/>
</svg>`.trim();
const HILLS_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(HILLS_SVG)}")`;

export const WALLPAPERS: readonly Wallpaper[] = [
  {
    id: "bliss",
    label: "Bliss",
    background:
      "radial-gradient(1200px 700px at 30% 45%, #b8e8f0 0%, #7ecfe4 35%, #55b3d5 60%, #2a86b4 100%)",
  },
  {
    id: "hills",
    label: "Green Hills",
    // Layered: hills silhouette on top, sky gradient below.
    background: `${HILLS_URL} bottom center / cover no-repeat, linear-gradient(to bottom, #b8e8f0 0%, #7ecfe4 55%, #55b3d5 100%)`,
  },
  {
    id: "sunrise",
    label: "Sunrise",
    background:
      "radial-gradient(1000px 600px at 30% 70%, #ffd08a 0%, #f39c65 35%, #d76b4a 65%, #7d3a5c 100%)",
  },
  {
    id: "teal",
    label: "Classic Teal",
    // Windows 95/98 default desktop teal. Solid color — pure nostalgia.
    background: "#008080",
  },
  {
    id: "starfield",
    label: "Starfield",
    // Dark navy with a sprinkle of stars via stacked radial-gradients.
    background:
      "radial-gradient(1px 1px at 20% 30%, #ffffff 100%, transparent), " +
      "radial-gradient(1px 1px at 70% 60%, #ffffff 100%, transparent), " +
      "radial-gradient(1.5px 1.5px at 40% 80%, #ffffff 100%, transparent), " +
      "radial-gradient(1px 1px at 85% 20%, #ffffff 100%, transparent), " +
      "radial-gradient(1px 1px at 55% 40%, #ffffff 100%, transparent), " +
      "radial-gradient(2px 2px at 15% 70%, #ffffff 100%, transparent), " +
      "radial-gradient(1px 1px at 90% 85%, #ffffff 100%, transparent), " +
      "linear-gradient(to bottom, #0a1240 0%, #1a1a4a 100%)",
  },
  {
    id: "matrix",
    label: "Terminal Green",
    // Old-school terminal: near-black background with faint green scanlines.
    background:
      "repeating-linear-gradient(0deg, rgba(51, 255, 102, 0.05) 0px, rgba(51, 255, 102, 0.05) 1px, transparent 1px, transparent 3px), " +
      "radial-gradient(ellipse at center, #0a2010 0%, #050d05 100%)",
  },
];

export const DEFAULT_WALLPAPER_ID = "bliss";

export function findWallpaper(id: string): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}
