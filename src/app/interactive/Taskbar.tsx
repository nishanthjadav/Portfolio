"use client";

import { useEffect, useState } from "react";
import { useWindowManager } from "./windowManager";

type Props = {
  onStartClick: () => void;
  startOpen: boolean;
  /** Kick off the log-off animation instead of navigating away directly. */
  onLogOff: () => void;
};

/**
 * Windows-XP-style taskbar. Left: Start button. Middle: running-window pills.
 * Right: clock. We tick the clock only after mount to avoid a server/client
 * hydration mismatch, since the initial time would differ between renders.
 */
export default function Taskbar({ onStartClick, startOpen, onLogOff }: Props) {
  const { state, dispatch } = useWindowManager();
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const format = () => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? "PM" : "AM";
      const hh = ((h + 11) % 12) + 1;
      const mm = m.toString().padStart(2, "0");
      return `${hh}:${mm} ${ampm}`;
    };
    setNow(format());
    const id = setInterval(() => setNow(format()), 15_000);
    return () => clearInterval(id);
  }, []);

  const onPillClick = (id: string, minimized: boolean, isTop: boolean) => {
    if (minimized) {
      dispatch({ type: "RESTORE_FROM_TASKBAR", id });
      return;
    }
    if (isTop) {
      dispatch({ type: "MINIMIZE", id });
    } else {
      dispatch({ type: "FOCUS", id });
    }
  };

  const topZ = state.windows.reduce((max, w) => (w.minimized ? max : Math.max(max, w.z)), -1);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[40px] flex items-stretch z-[9999]"
      onContextMenu={(e) => {
        // Right-clicking the taskbar shouldn't open the desktop's wallpaper
        // picker — this is its own chrome. Native menu still works.
        e.stopPropagation();
      }}
      style={{
        background:
          "linear-gradient(to bottom, #2564d8 0%, #1e50c0 6%, #245edd 20%, #2367e2 60%, #1c58c4 90%, #1548a4 100%)",
        borderTop: "1px solid #0033a2",
      }}
    >
      <button
        type="button"
        onClick={onStartClick}
        className="h-full pl-2.5 pr-4 flex items-center gap-1.5 text-white font-bold italic"
        style={{
          background: startOpen
            ? "linear-gradient(to bottom, #1c8e17 0%, #0a5f04 100%)"
            : "linear-gradient(to bottom, #3daf35 0%, #1e7a17 60%, #175b12 100%)",
          borderRadius: "0 12px 12px 0",
          border: "1px solid #0a4406",
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
          fontSize: 15,
          textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
          minWidth: 88,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="7" height="7" fill="#f14a4a" />
          <rect x="10" y="1" width="7" height="7" fill="#69d34e" />
          <rect x="1" y="10" width="7" height="7" fill="#3e8dea" />
          <rect x="10" y="10" width="7" height="7" fill="#f5c534" />
        </svg>
        start
      </button>

      {/* Running window pills */}
      <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto">
        {state.windows.map((w) => {
          const isTop = !w.minimized && w.z === topZ;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onPillClick(w.id, w.minimized, isTop)}
              className="h-[28px] px-2.5 flex items-center gap-1.5 min-w-[140px] max-w-[200px] truncate text-white text-left"
              style={{
                background: isTop
                  ? "linear-gradient(to bottom, #1b4ea6 0%, #2a67d0 100%)"
                  : "linear-gradient(to bottom, #3a7cd8 0%, #2a67d0 100%)",
                border: "1px solid rgba(0,0,0,0.3)",
                borderTopColor: isTop ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.3)",
                borderRadius: 3,
                fontFamily: 'Tahoma, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                textShadow: "1px 1px 0 rgba(0,0,0,0.35)",
              }}
              title={w.title}
            >
              <span className="truncate">{w.title}</span>
            </button>
          );
        })}
      </div>

      {/* Clock tray */}
      <div
        className="h-full px-3 flex items-center gap-2 text-white text-[11px]"
        style={{
          background: "linear-gradient(to bottom, #158dd7 0%, #0d75c5 100%)",
          borderLeft: "1px solid #0033a2",
          fontFamily: 'Tahoma, sans-serif',
          textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
          minWidth: 82,
          justifyContent: "center",
        }}
      >
        {now}
      </div>

      {/* Power button — triggers the same log-off animation as Start > Log Off. */}
      <button
        type="button"
        onClick={onLogOff}
        className="h-full px-2 flex items-center text-[14px] text-white/90 hover:text-white"
        style={{ background: "linear-gradient(to bottom, #0d75c5 0%, #0857a3 100%)" }}
        title="Log off"
        aria-label="Log off"
      >
        ⏻
      </button>
    </div>
  );
}
