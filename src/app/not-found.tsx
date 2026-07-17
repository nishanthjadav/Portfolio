"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * 404 as a "virus popup storm."
 *
 * On load, fake Windows-XP error dialogs start popping up at random positions,
 * stacking on top of one another. The cadence *accelerates* — the first popup
 * is lazy, each subsequent one arrives faster — until the screen is chaos.
 * Then the storm stops, the mess dims, and a single centered dialog fades in
 * with the real "get me out of here" links.
 *
 * Everything here is decorative; it deliberately does NOT use the interactive
 * route's window manager (no dragging/resizing needed). The chrome is copied
 * from interactive/Window.tsx so it matches nishOS pixel-for-pixel.
 */

// ── Tuning knobs ────────────────────────────────────────────────────────────
const MAX_POPUPS = 22; // how many junk dialogs before the storm resolves
const FIRST_DELAY = 550; // ms before the very first popup
const START_INTERVAL = 620; // ms between the first couple popups
const MIN_INTERVAL = 70; // fastest cadence at the climax
const DECAY = 0.82; // interval *= DECAY each popup → accelerating spawn
const RESOLVE_DELAY = 450; // beat between last junk popup and the final dialog

// Junk dialog copy. Titles pair with a body line; picked at random per popup.
const JUNK: { title: string; body: string; icon: "error" | "warn" | "info" }[] = [
  { title: "WINDOWS ERROR", body: "A fatal exception 404 has occurred.", icon: "error" },
  { title: "Warning", body: "This page could not be located on the system.", icon: "warn" },
  { title: "System Alert", body: "Your requested URL is doing something suspicious.", icon: "warn" },
  { title: "C:\\", body: "cd: no such file or directory", icon: "error" },
  { title: "Notepad", body: "The file 'that-page.txt' does not exist.", icon: "info" },
  { title: "Critical Error", body: "Page not found. Page not found. Page not fou—", icon: "error" },
  { title: "Message", body: "You are the 404th visitor! Claim your prize?", icon: "info" },
  { title: "Do you want to continue?", body: "Are you sure? Are you really sure?", icon: "warn" },
  { title: "nishOS", body: "Something went sideways. It's not your fault. (It's the URL's.)", icon: "info" },
  { title: "ERROR 0x194D504", body: "The page has left the building.", icon: "error" },
];

type Popup = {
  id: number;
  title: string;
  body: string;
  icon: "error" | "warn" | "info";
  x: number; // vw-relative %, 0..1
  y: number; // vh-relative %, 0..1
};

// Deterministic-enough pseudo-randomness seeded by index. We avoid Math.random
// at module scope, but inside effects it's fine — this is pure decoration and
// nothing here needs to be reproducible.
function makePopup(id: number): Popup {
  const j = JUNK[Math.floor(Math.random() * JUNK.length)];
  return {
    id,
    title: j.title,
    body: j.body,
    icon: j.icon,
    // Keep them roughly on-screen but scattered; bias toward the center mass.
    x: 0.08 + Math.random() * 0.72,
    y: 0.08 + Math.random() * 0.62,
  };
}

export default function NotFound() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [resolved, setResolved] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion (or accessibility): skip the chaos, go straight to the
    // final dialog.
    if (reduced) {
      setResolved(true);
      return;
    }

    let count = 0;
    let interval = START_INTERVAL;

    const spawn = () => {
      count += 1;
      setPopups((prev) => [...prev, makePopup(count)]);

      if (count >= MAX_POPUPS) {
        // Storm over → resolve into the final centered dialog.
        const t = window.setTimeout(() => setResolved(true), RESOLVE_DELAY);
        timers.current.push(t);
        return;
      }

      // Accelerate: shrink the gap toward MIN_INTERVAL each time.
      interval = Math.max(MIN_INTERVAL, interval * DECAY);
      const t = window.setTimeout(spawn, interval);
      timers.current.push(t);
    };

    const first = window.setTimeout(spawn, FIRST_DELAY);
    timers.current.push(first);

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        // Faint XP desktop teal so the popups read as "on the desktop."
        background:
          "linear-gradient(180deg, #5a7edc 0%, #3a6ea5 45%, #245edb 100%)",
      }}
    >
      {/* Junk popups. */}
      {popups.map((p, idx) => (
        <JunkDialog key={p.id} popup={p} z={100 + idx} dimmed={resolved} />
      ))}

      {/* Final centered dialog with the real links. */}
      {resolved && <FinalDialog />}

      <span className="sr-only">
        404 — page not found. Return to the home page, portfolio, or interactive
        mode using the links provided.
      </span>
    </main>
  );
}

/** A single fake error dialog. Non-interactive; the close button is a no-op. */
function JunkDialog({ popup, z, dimmed }: { popup: Popup; z: number; dimmed: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="absolute select-none"
      style={{
        left: `${popup.x * 100}%`,
        top: `${popup.y * 100}%`,
        zIndex: z,
        width: 300,
        background: "#ece9d8",
        border: "1px solid #0a246a",
        boxShadow: "2px 2px 0 rgba(0,0,0,0.35)",
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity 350ms ease-out",
        animation: "popup-in 140ms ease-out",
      }}
    >
      <TitleBar title={popup.title} />
      <div
        className="flex items-start gap-3 px-4 py-4"
        style={{ fontFamily: 'Tahoma, "MS Sans Serif", sans-serif', fontSize: 11, color: "#111" }}
      >
        <Glyph kind={popup.icon} />
        <div className="flex-1">
          <p className="leading-snug">{popup.body}</p>
          <div className="mt-4 flex justify-center">
            <XpButton>OK</XpButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The real dialog that ends the gag and points home. */
function FinalDialog() {
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        width: 460,
        background: "#ece9d8",
        border: "1px solid #0a246a",
        boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
        animation: "final-in 260ms ease-out",
      }}
    >
      <TitleBar title="nishOS — Recovery" />
      <div
        className="px-6 py-6"
        style={{ fontFamily: 'Tahoma, "MS Sans Serif", sans-serif', fontSize: 13, color: "#111" }}
      >
        <div className="flex items-start gap-4">
          <Glyph kind="info" />
          <div>
            <p className="font-bold text-[15px]">Error 404: Page not found.</p>
            <p className="mt-1.5 leading-snug text-[12px]">
              That page doesn&apos;t exist, but the rest of the site is perfectly
              fine. Where do you want to go?
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <XpLink href="/">Back home</XpLink>
          <XpLink href="/portfolio">Portfolio</XpLink>
          <XpLink href="/interactive">Interactive</XpLink>
        </div>
      </div>
    </div>
  );
}

// ── Shared XP chrome (mirrors interactive/Window.tsx) ─────────────────────────

function TitleBar({ title }: { title: string }) {
  return (
    <div
      className="h-7 px-1.5 flex items-center gap-1.5 cursor-default"
      style={{
        background:
          "linear-gradient(to bottom, #0997ff 0%, #0053ee 8%, #0050ee 40%, #06f 88%, #06f 93%, #005ce6 95%, #003bc4 100%)",
        color: "white",
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span className="flex-1 truncate select-none drop-shadow-[1px_1px_0_rgba(0,0,0,0.4)]">
        {title}
      </span>
      <FakeTitlebarButton label="_" />
      <FakeTitlebarButton label="☐" />
      <FakeTitlebarButton label="✕" variant="close" />
    </div>
  );
}

function FakeTitlebarButton({ label, variant }: { label: string; variant?: "close" }) {
  return (
    <span
      className="w-[22px] h-[20px] flex items-center justify-center leading-none text-white font-bold text-[13px]"
      style={{
        background:
          variant === "close"
            ? "linear-gradient(to bottom, #f18f83 0%, #d33025 40%, #a51611 100%)"
            : "linear-gradient(to bottom, #46a3ff 0%, #1367e4 45%, #0b48b6 100%)",
        border: "1px solid rgba(0,0,0,0.35)",
        borderRadius: 3,
        textShadow: "1px 1px 0 rgba(0,0,0,0.35)",
      }}
    >
      {label}
    </span>
  );
}

/** Beveled classic-Windows button (visual only). */
function XpButton({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center px-4 h-[23px] text-[11px]"
      style={{
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        background: "#ece9d8",
        border: "1px solid #003c74",
        borderRadius: 3,
        boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #aca899",
        minWidth: 66,
      }}
    >
      {children}
    </span>
  );
}

/** Same look as XpButton, but a real navigation link (used in FinalDialog). */
function XpLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-5 h-[30px] text-[12px] transition-[box-shadow,background] hover:brightness-[1.02] active:translate-y-px"
      style={{
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        background: "#ece9d8",
        border: "1px solid #003c74",
        borderRadius: 3,
        boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #aca899",
        color: "#111",
        minWidth: 100,
      }}
    >
      {children}
    </Link>
  );
}

/** Little classic message-box glyph: red X, yellow !, blue i. */
function Glyph({ kind }: { kind: "error" | "warn" | "info" }) {
  const map = {
    error: { bg: "#d33025", ch: "✕" },
    warn: { bg: "#f2c500", ch: "!" },
    info: { bg: "#0053ee", ch: "i" },
  } as const;
  const { bg, ch } = map[kind];
  return (
    <span
      className="flex items-center justify-center shrink-0 rounded-full text-white font-bold"
      style={{
        width: 28,
        height: 28,
        background: bg,
        fontSize: 16,
        fontFamily: kind === "info" ? "Georgia, serif" : "Tahoma, sans-serif",
        fontStyle: kind === "info" ? "italic" : "normal",
      }}
    >
      {ch}
    </span>
  );
}
