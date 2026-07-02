"use client";

import { useCallback, useEffect, useState } from "react";
import DesktopIcon from "./DesktopIcon";
import StartMenu from "./StartMenu";
import Taskbar from "./Taskbar";
import Window from "./Window";
import Notepad from "./apps/Notepad";
import Explorer from "./apps/Explorer";
import ImageViewer from "./apps/ImageViewer";
import PdfViewer from "./apps/PdfViewer";
import AboutComputer from "./apps/AboutComputer";
import Trash from "./apps/Trash";
import DisplayProperties from "./apps/DisplayProperties";
import LogOffSequence from "./LogOffSequence";
import { ROOT } from "./fileSystem";
import { TrashProvider, type TrashedItem } from "./trashContext";
import { useWindowManager, type WindowState } from "./windowManager";
import {
  DEFAULT_WALLPAPER_ID,
  OVERLAY_PATTERN_URL,
  findWallpaper,
} from "./wallpapers";
import { WallpaperProvider, useDesktopWallpaper } from "./wallpaperContext";

// localStorage key for the user's wallpaper choice. Namespaced so it doesn't
// collide with anything else on the same origin.
const WALLPAPER_STORAGE_KEY = "nishos-wallpaper";

/**
 * Free-form desktop-icon layout. Each icon has its own (x, y) so users can
 * drag them anywhere. Starting positions mimic the old fixed left-column grid.
 */
type IconId = "my-computer" | "projects" | "photos" | "resume" | "about" | "readme" | "system-info";

// Icons that are structurally part of the OS metaphor and can't be trashed —
// dropping them on the Recycle Bin is a no-op and the icon snaps back to where
// it came from. Everything else is fair game.
const UNTRASHABLE: ReadonlySet<IconId> = new Set(["my-computer", "system-info"]);

type IconEntry = {
  id: IconId;
  label: string;
  x: number;
  y: number;
};

const COL_X = 12;
const ROW_Y0 = 12;
const ROW_STEP = 82;

// DesktopIcon renders itself at `width: ICON_W` inside an 86×74 slot. Mirror
// those numbers here so we can hit-test drops against the bin without needing
// to read DOM geometry (its wrapper is a zero-size flow div — see below).
const ICON_W = 86;
const ICON_H = 74;

const INITIAL_ICONS: IconEntry[] = [
  { id: "my-computer", label: "My Computer", x: COL_X, y: ROW_Y0 + ROW_STEP * 0 },
  { id: "projects", label: "Projects", x: COL_X, y: ROW_Y0 + ROW_STEP * 1 },
  { id: "photos", label: "Photos", x: COL_X, y: ROW_Y0 + ROW_STEP * 2 },
  { id: "resume", label: "Resume.pdf", x: COL_X, y: ROW_Y0 + ROW_STEP * 3 },
  { id: "about", label: "About.txt", x: COL_X, y: ROW_Y0 + ROW_STEP * 4 },
  { id: "readme", label: "README.txt", x: COL_X, y: ROW_Y0 + ROW_STEP * 5 },
  { id: "system-info", label: "System Info", x: COL_X, y: ROW_Y0 + ROW_STEP * 6 },
];

/**
 * The desktop composes:
 *   - Wallpaper background (this component's own div)
 *   - Draggable icons anywhere on the workspace
 *   - Recycle Bin in the top-right corner (also draggable, also a drop target)
 *   - Any open windows on top
 *   - Taskbar pinned to the bottom
 *   - Start menu (conditional)
 */
export default function Desktop() {
  const { state, dispatch } = useWindowManager();
  const [startOpen, setStartOpen] = useState(false);
  const [icons, setIcons] = useState<IconEntry[]>(INITIAL_ICONS);
  const [trash, setTrash] = useState<IconEntry[]>([]);
  // Wallpaper id starts at the default so SSR + first client render match.
  // A useEffect below rehydrates from localStorage on mount.
  const [wallpaperId, setWallpaperId] = useState<string>(DEFAULT_WALLPAPER_ID);
  // Right-click context menu — null when closed. `x, y` is a client-space
  // point where the menu should anchor its top-left.
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  // Flipped to true when the user picks Log Off (from Start or the taskbar's
  // ⏻ button). While true, the LogOffSequence overlay renders on top of
  // everything and drives the exit navigation.
  const [loggingOff, setLoggingOff] = useState(false);

  useEffect(() => {
    const saved = globalThis.localStorage?.getItem(WALLPAPER_STORAGE_KEY);
    if (saved) setWallpaperId(saved);
  }, []);

  const changeWallpaper = (id: string) => {
    setWallpaperId(id);
    globalThis.localStorage?.setItem(WALLPAPER_STORAGE_KEY, id);
  };

  const wallpaper = findWallpaper(wallpaperId);

  // Recycle Bin lives in the top-right corner initially, but the user can drag
  // it too. We keep its position in state and derive the drop-target rect from
  // that state — reading the wrapping DOM node would give a zero-size rect
  // (the icon is `position: absolute` translated inside a flow div).
  const [trashPos, setTrashPos] = useState({ x: 0, y: ROW_Y0 });

  // Anchor the Recycle Bin's initial x to the right edge on mount. Doing this
  // in an effect (rather than at state init) avoids a server/client mismatch
  // — `innerWidth` is only defined in the browser.
  useEffect(() => {
    setTrashPos((p) => ({ x: globalThis.innerWidth - 12 - 86, y: p.y }));
  }, []);

  const openExplorer = (path: string, title: string) =>
    dispatch({ type: "OPEN", appId: "explorer", title, payload: { path } });
  const openText = (path: string, title: string) =>
    dispatch({ type: "OPEN", appId: "notepad", title, payload: { path } });
  const openPdf = (path: string, title: string) =>
    dispatch({ type: "OPEN", appId: "pdf-viewer", title, payload: { path } });
  const openAbout = () => dispatch({ type: "OPEN", appId: "about-computer", title: "System Properties" });
  const openDisplay = () =>
    dispatch({ type: "OPEN", appId: "display-properties", title: "Display Properties" });
  const openTrash = () =>
    dispatch({
      type: "OPEN",
      appId: "trash",
      title: trash.length === 0 ? "Recycle Bin" : `Recycle Bin (${trash.length})`,
    });

  // Handlers per icon id — pairs the free-form position with the correct app.
  const handlers: Record<IconId, { onOpen: () => void; icon: React.ReactNode }> = {
    "my-computer": { onOpen: () => openExplorer(ROOT.path, "My Computer"), icon: <MyComputerIcon /> },
    projects: { onOpen: () => openExplorer(`${ROOT.path}/Projects`, "Projects"), icon: <FolderIcon /> },
    photos: { onOpen: () => openExplorer(`${ROOT.path}/Photos`, "Photos"), icon: <FolderIcon /> },
    resume: { onOpen: () => openPdf(`${ROOT.path}/Resume.pdf`, "Resume.pdf"), icon: <PdfIcon /> },
    about: { onOpen: () => openText(`${ROOT.path}/About.txt`, "About.txt"), icon: <TextIcon /> },
    readme: { onOpen: () => openText(`${ROOT.path}/README.txt`, "README.txt"), icon: <TextIcon /> },
    "system-info": { onOpen: openAbout, icon: <InfoIcon /> },
  };

  const moveIcon = (id: IconId, x: number, y: number) => {
    setIcons((prev) => prev.map((it) => (it.id === id ? { ...it, x, y } : it)));
  };

  /**
   * Was a drop released over the Recycle Bin? Derived from `trashPos` + the
   * icon's fixed slot dimensions, so it stays accurate even after the bin has
   * been dragged. Doesn't rely on `getBoundingClientRect`, which returns zero
   * for the bin's flow-div wrapper.
   */
  const isOverTrash = useCallback(
    (clientX: number, clientY: number) => {
      const left = trashPos.x;
      const top = trashPos.y;
      const right = left + ICON_W;
      const bottom = top + ICON_H;
      return clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;
    },
    [trashPos.x, trashPos.y]
  );

  const trashIcon = (entry: IconEntry) => {
    setIcons((prev) => prev.filter((it) => it.id !== entry.id));
    setTrash((prev) => [...prev, entry]);
  };

  const restoreIcon = (id: string) => {
    const found = trash.find((it) => it.id === id);
    if (!found) return;
    setTrash((prev) => prev.filter((it) => it.id !== id));
    // Put the icon back exactly where it was before it hit the bin. Its
    // stored (x, y) is the pre-trash position, so no bump/reflow is needed.
    setIcons((prev) => [...prev, found]);
  };

  const restoreAllIcons = () => {
    if (trash.length === 0) return;
    setIcons((prev) => [...prev, ...trash]);
    setTrash([]);
  };

  // Build the payload the Trash window needs — resolved icon elements per id.
  const trashItems: TrashedItem[] = trash.map((e) => ({
    id: e.id,
    label: e.label,
    icon: handlers[e.id]?.icon ?? null,
  }));

  return (
    <WallpaperProvider wallpaperId={wallpaperId} changeWallpaper={changeWallpaper}>
      <TrashProvider items={trashItems} restore={restoreIcon} restoreAll={restoreAllIcons}>
      <div
        className="fixed inset-0 overflow-hidden select-none"
        onClick={() => {
          // Any click on the desktop dismisses transient overlays.
          if (startOpen) setStartOpen(false);
          if (contextMenu) setContextMenu(null);
        }}
        onContextMenu={(e) => {
          // Right-clicking empty desktop space opens the context menu. Icons
          // and windows call stopPropagation on their own contextmenu events
          // (see below), so this only fires on true "desktop background" hits.
          e.preventDefault();
          setStartOpen(false);
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
        style={{ background: wallpaper.background }}
      >
        {/*
          Retro-glyph overlay — a low-opacity repeating pattern of 4-pane flags,
          floppies, CRTs, and cursors that sits on top of every wallpaper. Kept
          in its own layer (rather than baked into each wallpaper) so it stays
          consistent across the whole set. `pointer-events-none` so it doesn't
          swallow clicks intended for the wallpaper / start menu dismisser.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: OVERLAY_PATTERN_URL,
            backgroundRepeat: "repeat",
          }}
        />
        {/* Free-form desktop icons — each absolutely positioned via its own x/y */}
        {icons.map((entry) => (
          <DesktopIcon
            key={entry.id}
            label={entry.label}
            x={entry.x}
            y={entry.y}
            onMove={(x, y) => moveIcon(entry.id, x, y)}
            onDrop={(cx, cy) => {
              if (!isOverTrash(cx, cy)) return false;
              // System icons (My Computer, System Info) refuse to be trashed —
              // consume the drop so DesktopIcon snaps the icon back to its
              // original spot instead of leaving it visually behind the bin.
              if (UNTRASHABLE.has(entry.id)) return true;
              trashIcon(entry);
              return true;
            }}
            onOpen={handlers[entry.id].onOpen}
            icon={handlers[entry.id].icon}
          />
        ))}

        {/* Recycle Bin — draggable like any other icon; also a drop target. */}
        <DesktopIcon
          label={trash.length === 0 ? "Recycle Bin" : `Recycle Bin (${trash.length})`}
          x={trashPos.x}
          y={trashPos.y}
          onOpen={openTrash}
          onMove={(x, y) => setTrashPos({ x, y })}
          icon={trash.length === 0 ? <TrashEmptyIcon /> : <TrashFullIcon />}
        />

        {/* Corner lockup — logo mark + wordmark, à la "Windows 7 Ultimate" */}
        <div
          className="absolute bottom-[52px] right-5 flex items-center gap-3 pointer-events-none text-white"
          style={{
            fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
            textShadow: "2px 2px 0 rgba(0,0,0,0.55)",
          }}
        >
          <NishOSLogoMark />
          <div className="leading-none">
            <div
              className="tracking-tight"
              style={{
                fontSize: 34,
                fontWeight: 300,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>nish</span>
              <span style={{ fontWeight: 700 }}>OS</span>
            </div>
            <div
              className="mt-1 text-white/75"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Portfolio Edition
            </div>
          </div>
        </div>

        {/* Windows */}
        {state.windows.map((win) => (
          <Window key={win.id} window={win}>
            <AppRenderer win={win} />
          </Window>
        ))}

        {startOpen ? (
          <StartMenu
            onClose={() => setStartOpen(false)}
            onLogOff={() => setLoggingOff(true)}
          />
        ) : null}

        {contextMenu ? (
          <DesktopContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onOpenDisplay={() => {
              openDisplay();
              setContextMenu(null);
            }}
          />
        ) : null}

        <Taskbar
          startOpen={startOpen}
          onStartClick={() => setStartOpen((v) => !v)}
          onLogOff={() => setLoggingOff(true)}
        />

        {/* Log-off overlay. Sits on top of everything else and drives the
            navigation to `/` once the animation finishes. */}
        {loggingOff ? <LogOffSequence /> : null}
      </div>
    </TrashProvider>
    </WallpaperProvider>
  );
}

function AppRenderer({ win }: { win: WindowState }) {
  const wallpaperCtx = useDesktopWallpaper();
  switch (win.appId) {
    case "notepad":
      return <Notepad payload={win.payload} />;
    case "explorer":
      return <Explorer payload={win.payload} />;
    case "image-viewer":
      return <ImageViewer payload={win.payload} />;
    case "pdf-viewer":
      return <PdfViewer payload={win.payload} />;
    case "about-computer":
      return <AboutComputer />;
    case "trash":
      return <Trash />;
    case "display-properties":
      return (
        <DisplayProperties
          currentId={wallpaperCtx.wallpaperId}
          onSelect={wallpaperCtx.changeWallpaper}
        />
      );
    default:
      return null;
  }
}

/**
 * Right-click context menu for the desktop wallpaper. Minimal XP-style
 * dropdown — currently just "Properties" (opens Display Properties), but the
 * shape is here for future entries (Refresh, Arrange Icons, etc.).
 *
 * Positioned in fixed coordinates from the right-click point. Clicking
 * anywhere else closes it via the desktop's onClick — this component only
 * renders the menu itself.
 */
function DesktopContextMenu({
  x,
  y,
  onClose,
  onOpenDisplay,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onOpenDisplay: () => void;
}) {
  // Nudge the menu so it never overflows the viewport. 180×~72 is a rough
  // upper bound on the menu's rendered size; good enough for a small list.
  const MENU_W = 180;
  const MENU_H = 76;
  const left = Math.min(x, globalThis.innerWidth - MENU_W - 4);
  const top = Math.min(y, globalThis.innerHeight - MENU_H - 4);

  return (
    <div
      className="fixed z-[9998]"
      style={{
        left,
        top,
        width: MENU_W,
        background: "#f5f4ea",
        border: "1px solid #7f7f7f",
        boxShadow: "2px 2px 5px rgba(0,0,0,0.35)",
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        fontSize: 11,
        color: "#111",
      }}
      // Prevent clicks inside the menu from bubbling to the desktop's onClick,
      // which would close it before the item's handler fires.
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ul className="py-1">
        <ContextMenuItem
          label="Properties"
          hint="Change wallpaper"
          onClick={() => {
            onOpenDisplay();
            onClose();
          }}
        />
      </ul>
    </div>
  );
}

function ContextMenuItem({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left px-3 py-1 flex items-center justify-between hover:bg-[#316ac5] hover:text-white"
      >
        <span>{label}</span>
        {hint ? <span className="text-[9px] text-gray-500 group-hover:text-white/80">{hint}</span> : null}
      </button>
    </li>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────
function MyComputerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <rect x="4" y="6" width="40" height="26" fill="#dcdcdc" stroke="#3a3a3a" strokeWidth="1.5" />
      <rect x="7" y="9" width="34" height="20" fill="#3d8be6" />
      <rect x="17" y="34" width="14" height="6" fill="#a9a9a9" stroke="#3a3a3a" strokeWidth="1.5" />
      <rect x="10" y="40" width="28" height="4" fill="#c0c0c0" stroke="#3a3a3a" strokeWidth="1.5" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40">
      <path d="M3 8 h14 l4 4 h25 v25 H3z" fill="#e5b940" stroke="#7c5a08" strokeWidth="1.5" />
      <path d="M3 13 h42 v24 H3z" fill="#ffd15c" stroke="#7c5a08" strokeWidth="1.5" />
    </svg>
  );
}
function TextIcon() {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48">
      <path d="M4 3 h22 l10 10 v32 H4z" fill="#ffffff" stroke="#4a4a4a" strokeWidth="1.5" />
      <path d="M26 3 v10 h10" fill="none" stroke="#4a4a4a" strokeWidth="1.5" />
      {[18, 23, 28, 33, 38].map((y) => (
        <line key={y} x1="9" y1={y} x2="31" y2={y} stroke="#3b73b9" strokeWidth="1.2" />
      ))}
    </svg>
  );
}
function PdfIcon() {
  // Same paper silhouette as TextIcon so the desktop reads as one style, with a
  // red "PDF" badge in the corner to disambiguate at a glance.
  return (
    <svg width="40" height="48" viewBox="0 0 40 48">
      <path d="M4 3 h22 l10 10 v32 H4z" fill="#ffffff" stroke="#4a4a4a" strokeWidth="1.5" />
      <path d="M26 3 v10 h10" fill="none" stroke="#4a4a4a" strokeWidth="1.5" />
      <rect x="6" y="28" width="22" height="12" rx="2" fill="#c8102e" />
      <text
        x="17"
        y="37"
        textAnchor="middle"
        fontFamily="Tahoma, Arial, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="#ffffff"
      >
        PDF
      </text>
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="18" fill="#3d8be6" stroke="#0f4a8a" strokeWidth="2" />
      <circle cx="22" cy="13" r="2.6" fill="#fff" />
      <rect x="20" y="17" width="4" height="16" fill="#fff" />
    </svg>
  );
}

/** Empty Recycle Bin — clean wireframe, matches the XP-era look. */
function TrashEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <rect x="9" y="14" width="30" height="30" rx="2" fill="#cfd8dc" stroke="#5a6266" strokeWidth="1.5" />
      <rect x="6" y="10" width="36" height="6" rx="1.5" fill="#e0e6e8" stroke="#5a6266" strokeWidth="1.5" />
      <rect x="20" y="6" width="8" height="4" rx="1" fill="#c2ccd1" stroke="#5a6266" strokeWidth="1.5" />
      {[16, 24, 32].map((x) => (
        <line key={x} x1={x} y1={20} x2={x} y2={40} stroke="#8a969b" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/** Full Recycle Bin — same shell, with wads of "paper" poking out the top. */
function TrashFullIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      {/* Crumpled papers behind the lid, drawn first so the lid overlaps */}
      <path d="M14 12 l4 -6 l6 3 l2 -4 l6 2 l4 -3 l2 6 z" fill="#ffffff" stroke="#5a6266" strokeWidth="1.2" />
      <rect x="9" y="14" width="30" height="30" rx="2" fill="#cfd8dc" stroke="#5a6266" strokeWidth="1.5" />
      <rect x="6" y="10" width="36" height="6" rx="1.5" fill="#e0e6e8" stroke="#5a6266" strokeWidth="1.5" />
      <rect x="20" y="6" width="8" height="4" rx="1" fill="#c2ccd1" stroke="#5a6266" strokeWidth="1.5" />
      {[16, 24, 32].map((x) => (
        <line key={x} x1={x} y1={20} x2={x} y2={40} stroke="#8a969b" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/**
 * Waving 4-pane flag mark, à la Windows XP/7 branding. Colors match the Start
 * button so the whole desktop reads as one system. Rendered as SVG so it stays
 * crisp at any size and doesn't add a network request.
 */
function NishOSLogoMark() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.4))",
      }}
    >
      <defs>
        {/* Subtle gloss overlays give each pane the "wet plastic" feel */}
        <linearGradient id="nishos-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>
      </defs>
      {/* skewX(-14) fakes the "flag catching the wind" tilt */}
      <g transform="translate(4 4) skewX(-14)">
        {/* Top-left — red */}
        <rect x="0" y="0" width="20" height="20" fill="#f14a4a" />
        <rect x="0" y="0" width="20" height="20" fill="url(#nishos-gloss)" />
        {/* Top-right — green */}
        <rect x="24" y="0" width="20" height="20" fill="#69d34e" />
        <rect x="24" y="0" width="20" height="20" fill="url(#nishos-gloss)" />
        {/* Bottom-left — blue */}
        <rect x="0" y="24" width="20" height="20" fill="#3e8dea" />
        <rect x="0" y="24" width="20" height="20" fill="url(#nishos-gloss)" />
        {/* Bottom-right — yellow */}
        <rect x="24" y="24" width="20" height="20" fill="#f5c534" />
        <rect x="24" y="24" width="20" height="20" fill="url(#nishos-gloss)" />
      </g>
    </svg>
  );
}
