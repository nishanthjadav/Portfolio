"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowManager, type WindowState } from "./windowManager";

type Props = {
  window: WindowState;
  children: ReactNode;
};

const MIN_W = 320;
const MIN_H = 200;
const TASKBAR_H = 40;

type Direction = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/**
 * Window chrome + drag/resize. Position and size live in the reducer, but
 * during an interactive drag/resize we bypass state and update via inline
 * transforms/dimensions in a ref-owned RAF loop — writing to state on every
 * mousemove would burn re-renders across every window. The final geometry
 * lands in state on mouseup.
 */
export default function Window({ window: win, children }: Props) {
  const { dispatch } = useWindowManager();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Live geometry during interactive drag/resize. Falls back to reducer state.
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const liveRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: win.x,
    y: win.y,
    w: win.width,
    h: win.height,
  });

  // Whenever the reducer's version updates (e.g. after mouseup, or externally
  // via TOGGLE_MAXIMIZE), sync the ref so future drags start from the right spot.
  useEffect(() => {
    liveRef.current = { x: win.x, y: win.y, w: win.width, h: win.height };
  }, [win.x, win.y, win.width, win.height]);

  const focus = useCallback(() => dispatch({ type: "FOCUS", id: win.id }), [dispatch, win.id]);

  // ── Drag ─────────────────────────────────────────────────────────────────
  const onTitleMouseDown = (e: React.MouseEvent) => {
    if (win.maximized) return;
    // Ignore clicks on the button cluster.
    if ((e.target as HTMLElement).closest("[data-titlebar-button]")) return;
    focus();
    setDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWinX = liveRef.current.x;
    const startWinY = liveRef.current.y;

    let raf = 0;
    let lastX = startWinX;
    let lastY = startWinY;

    function onMove(ev: MouseEvent) {
      const nx = Math.max(0, startWinX + (ev.clientX - startX));
      // Cap so the title bar never goes off the top of the screen.
      const maxY = globalThis.innerHeight - TASKBAR_H - 32;
      const ny = Math.min(maxY, Math.max(0, startWinY + (ev.clientY - startY)));
      lastX = nx;
      lastY = ny;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (rootRef.current) rootRef.current.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;
      });
    }

    function onUp() {
      globalThis.removeEventListener("mousemove", onMove);
      globalThis.removeEventListener("mouseup", onUp);
      liveRef.current.x = lastX;
      liveRef.current.y = lastY;
      dispatch({ type: "MOVE", id: win.id, x: lastX, y: lastY });
      setDragging(false);
    }

    globalThis.addEventListener("mousemove", onMove);
    globalThis.addEventListener("mouseup", onUp);
  };

  // ── Resize (8-direction) ─────────────────────────────────────────────────
  // Each direction tells us which edges are "live" and can push x/y as well as
  // grow/shrink w/h. Left/top edges are the interesting cases: dragging the
  // left edge leftward increases width *and* decreases x by the same delta.
  const startResize = (e: React.MouseEvent, dir: Direction) => {
    if (win.maximized) return;
    e.stopPropagation();
    focus();
    setResizing(true);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = liveRef.current.x;
    const startY = liveRef.current.y;
    const startW = liveRef.current.w;
    const startH = liveRef.current.h;

    const affectsE = dir.includes("e");
    const affectsW = dir.includes("w");
    const affectsS = dir.includes("s");
    const affectsN = dir.includes("n");

    let raf = 0;
    let nextX = startX;
    let nextY = startY;
    let nextW = startW;
    let nextH = startH;

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;

      if (affectsE) {
        nextW = Math.max(MIN_W, startW + dx);
      } else if (affectsW) {
        // Left edge: as x moves right (dx > 0), width shrinks; and vice versa.
        // Clamp so we can't shrink below MIN_W AND can't push the left edge
        // past the right edge of the window.
        const proposedW = Math.max(MIN_W, startW - dx);
        const consumedDx = startW - proposedW; // how much the width actually changed
        nextW = proposedW;
        nextX = Math.max(0, startX + consumedDx);
      }

      if (affectsS) {
        nextH = Math.max(MIN_H, startH + dy);
      } else if (affectsN) {
        const proposedH = Math.max(MIN_H, startH - dy);
        const consumedDy = startH - proposedH;
        nextH = proposedH;
        nextY = Math.max(0, startY + consumedDy);
      }

      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (rootRef.current) {
          rootRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
          rootRef.current.style.width = `${nextW}px`;
          rootRef.current.style.height = `${nextH}px`;
        }
      });
    }

    function onUp() {
      globalThis.removeEventListener("mousemove", onMove);
      globalThis.removeEventListener("mouseup", onUp);
      liveRef.current = { x: nextX, y: nextY, w: nextW, h: nextH };
      // Only dispatch what actually changed. MOVE + RESIZE are separate actions,
      // and either or both may fire depending on which edge was grabbed.
      if (nextX !== startX || nextY !== startY) {
        dispatch({ type: "MOVE", id: win.id, x: nextX, y: nextY });
      }
      if (nextW !== startW || nextH !== startH) {
        dispatch({ type: "RESIZE", id: win.id, width: nextW, height: nextH });
      }
      setResizing(false);
    }

    globalThis.addEventListener("mousemove", onMove);
    globalThis.addEventListener("mouseup", onUp);
  };

  // ── Titlebar buttons ─────────────────────────────────────────────────────
  const onMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "MINIMIZE", id: win.id });
  };
  const onMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "TOGGLE_MAXIMIZE",
      id: win.id,
      viewport: { width: globalThis.innerWidth, height: globalThis.innerHeight },
    });
  };
  const onClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "CLOSE", id: win.id });
  };

  if (win.minimized) return null;

  const transform = win.maximized
    ? `translate3d(0px, 0px, 0)`
    : `translate3d(${win.x}px, ${win.y}px, 0)`;
  const width = win.maximized ? `100vw` : `${win.width}px`;
  const height = win.maximized ? `calc(100vh - ${TASKBAR_H}px)` : `${win.height}px`;

  return (
    <div
      ref={rootRef}
      onMouseDown={focus}
      onContextMenu={(e) => {
        // Windows are their own thing — right-clicking inside a window
        // shouldn't open the desktop's wallpaper-picker context menu.
        // We still let the browser show its native menu (no preventDefault).
        e.stopPropagation();
      }}
      className={`absolute top-0 left-0 shadow-[2px_2px_0_rgba(0,0,0,0.35)] ${
        dragging || resizing ? "select-none" : ""
      }`}
      style={{
        transform,
        width,
        height,
        zIndex: win.z,
        background: "#ece9d8",
        border: "1px solid #0a246a",
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onTitleMouseDown}
        onDoubleClick={onMaximize}
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
          {win.title}
        </span>
        <TitlebarButton data-titlebar-button onClick={onMinimize} label="_" title="Minimize" />
        <TitlebarButton
          data-titlebar-button
          onClick={onMaximize}
          label={win.maximized ? "❐" : "☐"}
          title={win.maximized ? "Restore" : "Maximize"}
        />
        <TitlebarButton
          data-titlebar-button
          onClick={onClose}
          label="✕"
          title="Close"
          variant="close"
        />
      </div>

      {/* Body */}
      <div
        className="overflow-auto"
        style={{
          height: `calc(100% - 28px)`,
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
          fontSize: 11,
          color: "#111",
        }}
      >
        {children}
      </div>

      {/* Resize handles: 4 edges + 4 corners. Invisible hit areas around the
          frame; the visible SE grip indicator stays for retro flavor. Hidden
          when maximized. */}
      {!win.maximized ? (
        <>
          {/* Edges */}
          <ResizeHandle onStart={startResize} dir="n" className="top-0 left-2 right-2 h-[6px] cursor-n-resize" />
          <ResizeHandle onStart={startResize} dir="s" className="bottom-0 left-2 right-2 h-[6px] cursor-s-resize" />
          <ResizeHandle onStart={startResize} dir="w" className="left-0 top-7 bottom-2 w-[6px] cursor-w-resize" />
          <ResizeHandle onStart={startResize} dir="e" className="right-0 top-7 bottom-2 w-[6px] cursor-e-resize" />
          {/* Corners */}
          <ResizeHandle onStart={startResize} dir="nw" className="top-0 left-0 w-[10px] h-[10px] cursor-nw-resize" />
          <ResizeHandle onStart={startResize} dir="ne" className="top-0 right-0 w-[10px] h-[10px] cursor-ne-resize" />
          <ResizeHandle onStart={startResize} dir="sw" className="bottom-0 left-0 w-[10px] h-[10px] cursor-sw-resize" />
          <ResizeHandle onStart={startResize} dir="se" className="bottom-0 right-0 w-[14px] h-[14px] cursor-se-resize" />
          {/* Visible SE grip — layered above the SE hit area (bigger EDGE below) */}
          <div
            className="absolute bottom-0 right-0 w-3.5 h-3.5 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, transparent 0%, transparent 45%, #7a7a7a 45%, #7a7a7a 55%, transparent 55%, transparent 75%, #7a7a7a 75%, #7a7a7a 85%, transparent 85%)",
            }}
          />
        </>
      ) : null}
    </div>
  );
}

function ResizeHandle({
  onStart,
  dir,
  className,
}: {
  onStart: (e: React.MouseEvent, dir: Direction) => void;
  dir: Direction;
  className: string;
}) {
  return (
    <div
      onMouseDown={(e) => onStart(e, dir)}
      className={`absolute ${className}`}
      // Transparent hit area. Above the window body but under the titlebar
      // buttons; still catches events because it's inside the window root.
      style={{ zIndex: 1 }}
    />
  );
}

function TitlebarButton({
  onClick,
  label,
  title,
  variant,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  title: string;
  variant?: "close";
  "data-titlebar-button"?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      title={title}
      data-titlebar-button
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
    </button>
  );
}
