"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SEEN_KEY = "landing-seen";

// How long the "View Portfolio" wash takes to reach full opacity before we
// hand off to the router. Long enough to register as a transition, short
// enough to feel snappy — anything more and the click starts to feel laggy.
const PORTFOLIO_FADE_MS = 320;
// Extra grace between the wash reaching opacity 1 and firing router.push.
// The DOM swap paints the new route under the overlay, and if the overlay
// isn't 100% opaque at that instant the swap becomes visible as a "snap."
// One extra frame at 60fps is ~16ms; 60ms gives us slack for slower devices.
const PORTFOLIO_ROUTE_DELAY_MS = 60;

// Mirrors the Typewriter module cache. Buttons appear ~1.2s after mount on
// first-ever visit (letting the typewriter finish), immediately otherwise.
let hasPlayed = false;
let hydrated = false;

function readSkipFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const isReload = navEntry?.type === "reload";
  if (isReload) {
    sessionStorage.removeItem(SEEN_KEY);
    hasPlayed = false;
    return false;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1";
  return reduced || alreadySeen;
}

export default function LandingButtons() {
  // Initial render server + first-client: always hidden → hydration safe.
  // On client-side remounts, useState picks up hasPlayed synchronously so
  // buttons never disappear when navigating back.
  const [visible, setVisible] = useState<boolean>(() => hasPlayed);
  // Flipped when the user clicks "View Portfolio". Drives a paper-colored
  // wash that fades in over the landing page while we defer the actual
  // route change until the animation completes.
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      hydrated = true;
      if (readSkipFromStorage()) {
        hasPlayed = true;
        setVisible(true);
        return;
      }
    } else if (hasPlayed) {
      setVisible(true);
      return;
    }

    const t = setTimeout(() => {
      setVisible(true);
      hasPlayed = true;
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const goToPortfolio = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Modifier-clicks (open-in-new-tab, etc.) should keep their native
    // behavior — no fade, no interception.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (leaving) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      router.push("/portfolio");
      return;
    }

    setLeaving(true);
    // Wait for the wash to be fully opaque *and* one extra beat before we
    // swap the route. If we push while the overlay is still 95% opaque, the
    // new page paints under it and the residual translucency reads as a
    // jump. The extra grace lets the browser commit the final opaque frame.
    window.setTimeout(() => {
      router.push("/portfolio");
    }, PORTFOLIO_FADE_MS + PORTFOLIO_ROUTE_DELAY_MS);
  };

  return (
    <>
    <div
      className={`mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Link
        href="/portfolio"
        onClick={goToPortfolio}
        className="group inline-flex items-center justify-center px-5 py-3 text-sm font-medium bg-ink text-paper rounded-md hover:opacity-90 transition-opacity"
      >
        View Portfolio
        <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
      <Link
        href="/interactive"
        className="group inline-flex items-center justify-center px-5 py-3 text-sm font-medium border border-hair rounded-md hover:border-ink transition-colors"
      >
        <span>Interactive Mode</span>
        <span className="ml-2 inline-flex text-muted group-hover:text-ink transition-colors" aria-hidden="true">
          <WindowsFlag />
        </span>
      </Link>
    </div>

    {/*
      Paper-colored wash that fades in over the landing page while we defer
      the route change. Deliberately understated: same color as the body so
      it reads as a gentle dissolve rather than a curtain drop. Sits above
      everything (z high) and swallows pointer events so a second click
      can't retrigger navigation mid-fade.

      Easing note: `ease-in` (starts slow, ends fast) beats `ease-out` here
      because the DOM swap happens at the tail — we want the overlay at
      full opacity by then, not lingering in the near-opaque range where a
      swap would show through as a snap. `will-change` promotes the layer
      up front so the browser isn't mid-optimizing during the animation.
    */}
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] bg-paper pointer-events-none transition-opacity ease-in ${
        leaving ? "opacity-100 pointer-events-auto" : "opacity-0"
      }`}
      style={{
        transitionDuration: `${PORTFOLIO_FADE_MS}ms`,
        willChange: "opacity",
      }}
    />
    </>
  );
}

/**
 * Tiny 4-pane flag mark — mirrors the nishOS logo on the interactive desktop,
 * so the button visually previews where it goes. Rendered in the current text
 * color (via `fill="currentColor"`) so it inherits hover states from the link.
 */
function WindowsFlag() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      {/* skewX fakes the "flag catching the wind" tilt of the desktop mark */}
      <g transform="translate(1 1) skewX(-12)">
        <rect x="0" y="0" width="5.5" height="5.5" />
        <rect x="6.5" y="0" width="5.5" height="5.5" />
        <rect x="0" y="6.5" width="5.5" height="5.5" />
        <rect x="6.5" y="6.5" width="5.5" height="5.5" />
      </g>
    </svg>
  );
}
