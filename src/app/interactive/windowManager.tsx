"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

/**
 * A single window's identity + geometry. `appId` tells the renderer which
 * component to mount inside the frame; `payload` is opaque, app-specific data
 * (e.g. { path: "/Projects/desk-watcher/description.txt" } for Notepad).
 */
export type WindowState = {
  id: string;
  appId: AppId;
  title: string;
  payload?: unknown;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  // Pre-maximize geometry, so Restore can put the window back exactly where it was.
  restore?: { x: number; y: number; width: number; height: number };
};

export type AppId = "notepad" | "explorer" | "image-viewer" | "pdf-viewer" | "about-computer" | "trash" | "display-properties";

type State = {
  windows: WindowState[];
  // Monotonically increasing counter for z-index and unique ids.
  nextZ: number;
  nextId: number;
};

export type Action =
  | { type: "OPEN"; appId: AppId; title: string; payload?: unknown; width?: number; height?: number }
  | { type: "CLOSE"; id: string }
  | { type: "FOCUS"; id: string }
  | { type: "MOVE"; id: string; x: number; y: number }
  | { type: "RESIZE"; id: string; width: number; height: number }
  | { type: "MINIMIZE"; id: string }
  | { type: "TOGGLE_MAXIMIZE"; id: string; viewport: { width: number; height: number } }
  | { type: "RESTORE_FROM_TASKBAR"; id: string };

const INITIAL_STATE: State = { windows: [], nextZ: 10, nextId: 1 };

// Default window dimensions per app. Notepad wants to be tall + narrow;
// Explorer benefits from being wider.
const DEFAULTS: Record<AppId, { width: number; height: number }> = {
  notepad: { width: 640, height: 560 },
  explorer: { width: 640, height: 440 },
  "image-viewer": { width: 640, height: 520 },
  "pdf-viewer": { width: 760, height: 820 },
  "about-computer": { width: 360, height: 260 },
  trash: { width: 520, height: 380 },
  "display-properties": { width: 520, height: 440 },
};

function cascadeOffset(n: number) {
  // Each new window shifts down-right so they don't stack invisibly.
  return 30 + (n % 6) * 26;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN": {
      const size = { ...DEFAULTS[action.appId], ...(action.width ? { width: action.width } : {}), ...(action.height ? { height: action.height } : {}) };
      const offset = cascadeOffset(state.windows.length);
      const win: WindowState = {
        id: `w${state.nextId}`,
        appId: action.appId,
        title: action.title,
        payload: action.payload,
        x: offset,
        y: offset,
        width: size.width,
        height: size.height,
        z: state.nextZ,
        minimized: false,
        maximized: false,
      };
      return {
        windows: [...state.windows, win],
        nextZ: state.nextZ + 1,
        nextId: state.nextId + 1,
      };
    }
    case "CLOSE": {
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) };
    }
    case "FOCUS": {
      // Bring window to front by giving it the new top z. Also un-minimizes,
      // which matches the behavior of clicking a taskbar item.
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const alreadyTop = target.z === state.nextZ - 1 && !target.minimized;
      if (alreadyTop) return state;
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z: state.nextZ, minimized: false } : w)),
        nextZ: state.nextZ + 1,
      };
    }
    case "MOVE": {
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, x: action.x, y: action.y } : w)),
      };
    }
    case "RESIZE": {
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, width: action.width, height: action.height } : w)),
      };
    }
    case "MINIMIZE": {
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w)),
      };
    }
    case "TOGGLE_MAXIMIZE": {
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.id !== action.id) return w;
          if (w.maximized && w.restore) {
            return { ...w, maximized: false, x: w.restore.x, y: w.restore.y, width: w.restore.width, height: w.restore.height, restore: undefined };
          }
          return {
            ...w,
            maximized: true,
            restore: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: 0,
            width: action.viewport.width,
            // reserve 40px for the taskbar
            height: action.viewport.height - 40,
          };
        }),
      };
    }
    case "RESTORE_FROM_TASKBAR": {
      // Clicking a taskbar pill for a minimized window: un-minimize + focus.
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, minimized: false, z: state.nextZ } : w)),
        nextZ: state.nextZ + 1,
      };
    }
    default:
      return state;
  }
}

const WindowManagerContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  return <WindowManagerContext.Provider value={{ state, dispatch }}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used inside <WindowManagerProvider>");
  return ctx;
}
