"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Full-screen log-off animation. Mounts on top of the desktop when the user
 * picks Start > Log Off or clicks the taskbar's ⏻ power button.
 *
 * Sequence:
 *   1. `text` phase — the desktop is covered by a dark overlay and the classic
 *      "Logging off..." card. Runs ~1500ms.
 *   2. `crt` phase — the whole overlay collapses vertically to a bright
 *      horizontal line, then that line fades out. ~700ms. Evokes an old CRT
 *      losing signal.
 *   3. Navigate to `/` (the landing page).
 *
 * Respects `prefers-reduced-motion` by jumping straight to the redirect.
 */
const TEXT_MS = 1000;
const CRT_MS = 700;

export default function LogOffSequence() {
  const router = useRouter();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      router.push("/");
      return;
    }

    // Total on-screen time before navigation. The CRT-collapse animation
    // duration matches the `crt` phase below, so the redirect lands right
    // after the horizontal line fades to black.
    const exitTimer = setTimeout(() => {
      router.push("/");
    }, TEXT_MS + CRT_MS);

    return () => clearTimeout(exitTimer);
  }, [router]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[10000] overflow-hidden"
      style={{
        background: "#000",
        color: "#e6e6e6",
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
      }}
    >
      {/*
        Keyframes shipped with the component. Unique names to avoid collisions
        (same pattern as BootSequence).
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes logoffCrtCollapse {
              0%   { transform: scaleY(1); opacity: 1; }
              70%  { transform: scaleY(0.006); opacity: 1; }
              100% { transform: scaleY(0.006); opacity: 0; }
            }
            @keyframes logoffSpin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes logoffDelayedCollapse {
              /*
                Hold the "logging off" card visible for TEXT_MS, then collapse.
                Encoded as a single animation with a delay so we don't need a
                separate React phase for the two stages.
              */
              0%, 68.18%  { transform: scaleY(1); opacity: 1; }
              99.09%      { transform: scaleY(0.006); opacity: 1; }
              100%        { transform: scaleY(0.006); opacity: 0; }
            }
          `,
        }}
      />

      <div
        className="w-full h-full flex flex-col items-center justify-center"
        style={{
          transformOrigin: "center center",
          // Total duration = TEXT_MS + CRT_MS = 2200ms. Percentages in the
          // keyframe carve out the "hold" and "collapse" portions.
          animation: `logoffDelayedCollapse ${TEXT_MS + CRT_MS}ms cubic-bezier(0.5, 0, 0.75, 0) forwards`,
        }}
      >
        {/* XP-style "please wait" card */}
        <div
          className="flex items-center gap-4 px-8 py-6"
          style={{
            background: "linear-gradient(to bottom, #0997ff 0%, #0053ee 8%, #0050ee 40%, #06f 88%)",
            color: "white",
            border: "1px solid #0a246a",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.55)",
            minWidth: 380,
          }}
        >
          <Spinner />
          <div className="flex flex-col leading-tight">
            <div style={{ fontSize: 14, fontWeight: 700 }}>Logging off...</div>
            <div className="mt-1 text-white/85" style={{ fontSize: 11 }}>
              Saving your session and returning to the launcher.
            </div>
          </div>
        </div>

        <div
          className="mt-6 text-[10px] text-white/45 tracking-widest uppercase"
          style={{ fontFamily: '"Lucida Console", "Courier New", monospace' }}
        >
          nishOS
        </div>
      </div>
    </div>
  );
}

/**
 * Little spinning ring. "Circular thing that rotates" is enough visual
 * language for "loading."
 */
function Spinner() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      style={{ animation: "logoffSpin 1.2s linear infinite" }}
    >
      <defs>
        <linearGradient id="logoff-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
        </linearGradient>
      </defs>
      <circle
        cx="18"
        cy="18"
        r="13"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="3"
      />
      <path
        d="M 18 5 A 13 13 0 0 1 31 18"
        fill="none"
        stroke="url(#logoff-ring)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
