"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "interactive-booted";

// Total boot duration. Split into an opaque "booting" phase and a short fade
// so the desktop reveals underneath instead of popping in.
const BOOT_MS = 1400;
const FADE_MS = 400;

/**
 * Full-screen retro-OS boot animation. Mounts on top of the desktop, then
 * fades out and unmounts itself. Skipped for:
 *   - repeat visits in the same session (sessionStorage flag),
 *   - users with prefers-reduced-motion.
 *
 * Reloading the page clears the flag, matching the landing page's typewriter.
 */
export default function BootSequence() {
  // Start hidden on the server + first client render to avoid hydration mismatch,
  // then decide in an effect whether to play. If we skip the boot, we never
  // render anything.
  const [phase, setPhase] = useState<"pending" | "booting" | "fading" | "done">("pending");

  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = navEntry?.type === "reload";
    if (isReload) sessionStorage.removeItem(SEEN_KEY);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1";
    if (reduced || alreadySeen) {
      setPhase("done");
      return;
    }

    setPhase("booting");
    const bootTimer = setTimeout(() => setPhase("fading"), BOOT_MS);
    const fadeTimer = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setPhase("done");
    }, BOOT_MS + FADE_MS);

    return () => {
      clearTimeout(bootTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (phase === "done" || phase === "pending") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{
        background: "#000",
        color: "#e6e6e6",
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      {/*
        Keyframes shipped with the component. This dodges any question of
        whether globals.css was re-parsed after HMR / Turbopack cache misses —
        the rules are inserted into the DOM the moment this component mounts.
        `dangerouslySetInnerHTML` avoids React quirks around `<style>` children.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes bootSequenceFill {
              0% { transform: scaleX(0); }
              100% { transform: scaleX(1); }
            }
            @keyframes bootSequenceShimmer {
              0% { background-position: 0 0; }
              100% { background-position: 40px 0; }
            }
          `,
        }}
      />
      {/* Tiny POST-style banner in the top-left, for flavor */}
      <div
        className="absolute top-4 left-4 text-[11px] opacity-70"
        style={{ fontFamily: '"Lucida Console", "Courier New", monospace' }}
      >
        nishOS&nbsp;· &nbsp;booting from C:\
      </div>

      {/* Center lockup — flag mark + wordmark, same iconography as the desktop */}
      <div className="flex items-center gap-4">
        <BootFlag />
        <div className="leading-none">
          <div
            className="tracking-tight"
            style={{
              fontSize: 44,
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: "#f4f4f4",
            }}
          >
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>nish</span>
            <span style={{ fontWeight: 700 }}>OS</span>
          </div>
          <div
            className="mt-2 text-white/60"
            style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Portfolio Edition
          </div>
        </div>
      </div>

      {/* XP-style progress bar — a full-width bar scales from 0 → 1 on the X
          axis (origin: left), so the fill visibly grows left-to-right. Using
          `transform: scaleX` instead of animating `width` sidesteps any inline
          vs. keyframe specificity gotchas and stays GPU-accelerated. */}
      <div
        className="mt-10 h-3 w-[240px] overflow-hidden"
        style={{
          border: "1px solid #2a2a2a",
          background: "#0d0d0d",
          borderRadius: 3,
        }}
      >
        <div
          className="w-full h-full"
          onAnimationEnd={(e) => {
            // Two animations run on this element (fill + shimmer). Only the
            // fill's completion should trigger the fade — shimmer loops forever.
            if (e.animationName === "bootSequenceFill") setPhase("fading");
          }}
          style={{
            transformOrigin: "left center",
            transform: "scaleX(0)",
            background:
              // Base green fill + repeating diagonal shimmer stripes on top.
              "linear-gradient(135deg, rgba(255,255,255,0.22) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.22) 75%, transparent 75%, transparent), linear-gradient(90deg, #4a9c2e 0%, #6db33f 50%, #a4e46b 100%)",
            backgroundSize: "20px 20px, 100% 100%",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25)",
            // Keyframes are inlined into a <style> tag at the top of this component.
            animation: `bootSequenceFill ${BOOT_MS}ms cubic-bezier(0.3, 0.1, 0.4, 1) forwards, bootSequenceShimmer 700ms linear infinite`,
            willChange: "transform, background-position",
          }}
        />
      </div>

      <div className="mt-3 text-[10px] text-white/50 tracking-widest uppercase">
        Please wait
      </div>
    </div>
  );
}

/**
 * Larger, brighter version of the nishOS desktop mark — same 4-pane flag,
 * beefier drop shadow so it reads against the black boot background.
 */
function BootFlag() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 52 52"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}
    >
      <defs>
        <linearGradient id="boot-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>
      </defs>
      <g transform="translate(4 4) skewX(-14)">
        <rect x="0" y="0" width="20" height="20" fill="#f14a4a" />
        <rect x="0" y="0" width="20" height="20" fill="url(#boot-gloss)" />
        <rect x="24" y="0" width="20" height="20" fill="#69d34e" />
        <rect x="24" y="0" width="20" height="20" fill="url(#boot-gloss)" />
        <rect x="0" y="24" width="20" height="20" fill="#3e8dea" />
        <rect x="0" y="24" width="20" height="20" fill="url(#boot-gloss)" />
        <rect x="24" y="24" width="20" height="20" fill="#f5c534" />
        <rect x="24" y="24" width="20" height="20" fill="url(#boot-gloss)" />
      </g>
    </svg>
  );
}
