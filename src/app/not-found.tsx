"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// The "shell" transcript we type out on load. Two lines: the command the
// "user" ran, then the error. We type the error line character-by-character
// (matching the landing page's Typewriter feel) and leave a blinking cursor
// parked at the end.
const CMD_LINE = "$ cd /that-page";
const ERR_LINE = "cd: no such file or directory";
const SPEED = 45; // ms per character — slightly quicker than the landing hero

export default function NotFound() {
  // Number of characters of ERR_LINE revealed so far.
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Respect reduced-motion: snap straight to the finished transcript.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setI(ERR_LINE.length);
      setDone(true);
      return;
    }

    // Small beat before typing so the command line reads first, then the
    // error "responds."
    const start = setTimeout(() => {
      const id = setInterval(() => {
        setI((prev) => {
          if (prev >= ERR_LINE.length) {
            clearInterval(id);
            setDone(true);
            return prev;
          }
          return prev + 1;
        });
      }, SPEED);
    }, 500);

    return () => clearTimeout(start);
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl">
        {/* Terminal transcript. Left-aligned monospace so it reads as a shell. */}
        <div className="text-sm sm:text-base text-muted leading-relaxed">
          <p>{CMD_LINE}</p>
          <p aria-hidden="true">
            {ERR_LINE.slice(0, i)}
            {!done && (
              <span className="inline-block w-[0.5ch] h-[1em] align-[-0.15em] bg-muted animate-blink" />
            )}
          </p>
          <span className="sr-only">{ERR_LINE}</span>
        </div>

        {/* Big 404 mark. */}
        <h1 className="mt-8 text-6xl sm:text-7xl font-medium tracking-[0.2em] text-ink">
          404
        </h1>

        {/* Message with a blinking cursor parked at the end once typing finishes. */}
        <p className="mt-4 text-lg sm:text-xl text-ink">
          This page wandered off.
          <span
            className={`inline-block w-[0.06em] h-[0.9em] align-[-0.1em] ml-[0.12em] bg-ink ${
              done ? "animate-blink" : "opacity-0"
            }`}
            aria-hidden="true"
          />
        </p>

        {/* Nav back into the site — mirrors LandingButtons styling. */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href="/"
            className="group inline-flex items-center justify-center px-5 py-3 text-sm font-medium bg-ink text-paper rounded-md hover:opacity-90 transition-opacity"
          >
            <span className="mr-2 transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            Back home
          </Link>
          <Link
            href="/portfolio"
            className="group inline-flex items-center justify-center px-5 py-3 text-sm font-medium border border-hair rounded-md hover:border-ink transition-colors"
          >
            View Portfolio
            <span className="ml-2 transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
