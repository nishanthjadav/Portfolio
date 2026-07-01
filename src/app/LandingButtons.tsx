"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SEEN_KEY = "landing-seen";

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

  return (
    <div
      className={`mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Link
        href="/portfolio"
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
        <span className="ml-2 text-muted group-hover:text-ink transition-colors">⌘</span>
      </Link>
    </div>
  );
}
