"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  label: string;
  x: number;
  y: number;
  onOpen: () => void;
  onMove: (x: number, y: number) => void;
  /**
   * Called on mouseup at the pointer's final screen position. If the parent
   * returns `true`, it has consumed the drop (e.g. trashed the icon) and the
   * normal move dispatch is skipped.
   */
  onDrop?: (clientX: number, clientY: number) => boolean;
  icon: ReactNode;
};

// Distance the pointer must travel before we commit to a drag. Below this
// threshold, mouseup is treated as a click and double-click still fires.
const DRAG_SLOP = 4;

// Reserve space so icons can't be buried under the taskbar or dragged off the
// visible area entirely.
const TASKBAR_H = 40;
const ICON_W = 86;
const ICON_H = 74;

/**
 * Draggable desktop icon. Owns its own drag lifecycle (mousedown → threshold
 * → mousemove RAF loop → mouseup commits), but position lives in the parent
 * so all icons can share one state authority.
 */
export default function DesktopIcon({ label, x, y, onOpen, onMove, onDrop, icon }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  // If parent updates x/y (e.g. persisted layout restore), reflect it back
  // onto the DOM. During an active drag the mousemove handler is authoritative,
  // so we skip this sync until drag ends.
  useEffect(() => {
    if (dragging) return;
    if (rootRef.current) rootRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [x, y, dragging]);

  const onMouseDown = (e: React.MouseEvent) => {
    // Left-click only.
    if (e.button !== 0) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = x;
    const startY = y;

    let raf = 0;
    let nextX = startX;
    let nextY = startY;
    let lastClientX = startClientX;
    let lastClientY = startClientY;
    let dragStarted = false;

    function onPointerMove(ev: MouseEvent) {
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      lastClientX = ev.clientX;
      lastClientY = ev.clientY;

      if (!dragStarted) {
        // Wait for slop before committing to a drag — this preserves the
        // click / double-click affordances for accidental micro-movements.
        if (Math.hypot(dx, dy) < DRAG_SLOP) return;
        dragStarted = true;
        setDragging(true);
      }

      // Clamp so the icon stays inside the visible workspace.
      const maxX = Math.max(0, globalThis.innerWidth - ICON_W);
      const maxY = Math.max(0, globalThis.innerHeight - TASKBAR_H - ICON_H);
      nextX = Math.min(maxX, Math.max(0, startX + dx));
      nextY = Math.min(maxY, Math.max(0, startY + dy));

      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (rootRef.current) rootRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      });
    }

    function onUp() {
      globalThis.removeEventListener("mousemove", onPointerMove);
      globalThis.removeEventListener("mouseup", onUp);
      if (dragStarted) {
        // Commit and suppress the trailing click event so double-click doesn't
        // accidentally fire on a drag-release-in-place.
        const cancelClick = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          globalThis.removeEventListener("click", cancelClick, true);
        };
        globalThis.addEventListener("click", cancelClick, true);
        // Give the parent a chance to consume this drop (e.g. trash bin hit).
        const consumed = onDrop ? onDrop(lastClientX, lastClientY) : false;
        if (!consumed) {
          onMove(nextX, nextY);
        } else if (rootRef.current) {
          // Parent consumed the drop but the icon might still exist (e.g. an
          // untrashable icon rejected by the bin). Snap the DOM back to the
          // authoritative prop coords, since the drag-time transform is stale.
          rootRef.current.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
        }
        setDragging(false);
      }
    }

    globalThis.addEventListener("mousemove", onPointerMove);
    globalThis.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={rootRef}
      // Kick off with the initial position; useEffect keeps us in sync afterward.
      style={{ transform: `translate3d(${x}px, ${y}px, 0)`, width: ICON_W }}
      className="absolute top-0 left-0"
    >
      <button
        type="button"
        onMouseDown={onMouseDown}
        onDoubleClick={onOpen}
        onContextMenu={(e) => {
          // Suppress both the browser's native context menu and the desktop's
          // "right-click on wallpaper" handler — right-clicking an icon
          // shouldn't open the wallpaper picker.
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`w-full flex flex-col items-center gap-1 p-1 rounded outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/40 hover:bg-white/5 ${
          dragging ? "opacity-70 cursor-grabbing" : "cursor-default"
        }`}
        style={{ color: "white" }}
      >
        <div className="w-[48px] h-[48px] flex items-center justify-center">{icon}</div>
        <span
          className="text-center leading-tight px-1 rounded-sm max-w-full"
          style={{
            fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
            fontSize: 11,
            textShadow: "1px 1px 0 rgba(0,0,0,0.9)",
          }}
        >
          {label}
        </span>
      </button>
    </div>
  );
}

