"use client";

import { useEffect, useState } from "react";

const TEXT = "Hi, I'm Nishanth.";
const SPEED = 55;
const START_DELAY = 200;
const SEEN_KEY = "landing-seen";

// Module-scope flag: remembers whether the animation has already played in
// this tab, even across client-side navigations that unmount+remount this
// component. Survives until the tab is closed OR the user hard-reloads
// (which we detect via the navigation timing entry and reset).
let hasPlayed = false;
let hydrated = false;

function readSkipFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const isReload = navEntry?.type === "reload";
  if (isReload) {
    // Hard reload → treat as fresh, replay animation.
    sessionStorage.removeItem(SEEN_KEY);
    hasPlayed = false;
    return false;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1";
  return reduced || alreadySeen;
}

export default function Typewriter() {
  // Server + very first client render: identical (i=0, done=false) → hydration safe.
  // After first hydration we sync module state with sessionStorage exactly once,
  // then remounts of this component can read `hasPlayed` synchronously via useState.
  const [i, setI] = useState<number>(() => (hasPlayed ? TEXT.length : 0));
  const [done, setDone] = useState<boolean>(() => hasPlayed);

  useEffect(() => {
    // Only touch storage once per tab. After that, hasPlayed is our source of truth.
    if (!hydrated) {
      hydrated = true;
      if (readSkipFromStorage()) {
        hasPlayed = true;
        setI(TEXT.length);
        setDone(true);
        sessionStorage.setItem(SEEN_KEY, "1");
        return;
      }
    } else if (hasPlayed) {
      // Return-visit via client nav. Snap to finished state.
      setI(TEXT.length);
      setDone(true);
      return;
    }

    // Play the animation (first-ever visit in this tab).
    const start = setTimeout(() => {
      const id = setInterval(() => {
        setI((prev) => {
          if (prev >= TEXT.length) {
            clearInterval(id);
            setDone(true);
            hasPlayed = true;
            sessionStorage.setItem(SEEN_KEY, "1");
            return prev;
          }
          return prev + 1;
        });
      }, SPEED);
    }, START_DELAY);

    return () => clearTimeout(start);
  }, []);

  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight">
      <span aria-hidden="true">
        {TEXT.slice(0, i)}
        <span
          className={`inline-block w-[0.06em] h-[0.9em] align-[-0.1em] ml-[0.05em] bg-ink ${
            done ? "animate-blink" : ""
          }`}
        />
      </span>
      <span className="sr-only">{TEXT}</span>
      <br />
      <span
        className={`block mt-3 text-lg sm:text-xl md:text-2xl font-normal text-muted transition-opacity duration-700 ${
          done ? "opacity-100" : "opacity-0"
        }`}
      >
        Software Engineer <span aria-hidden="true">·</span> CS + Math @ Villanova
      </span>
    </h1>
  );
}
