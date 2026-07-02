"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Wallpaper context. Threaded through the desktop tree so AppRenderer's
 * DisplayProperties window can read/write the wallpaper without prop-drilling
 * from Desktop → Window → children.
 */
type WallpaperContextValue = {
  wallpaperId: string;
  changeWallpaper: (id: string) => void;
};

const WallpaperContext = createContext<WallpaperContextValue | null>(null);

export function WallpaperProvider({
  wallpaperId,
  changeWallpaper,
  children,
}: WallpaperContextValue & { children: ReactNode }) {
  return (
    <WallpaperContext.Provider value={{ wallpaperId, changeWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useDesktopWallpaper() {
  const ctx = useContext(WallpaperContext);
  if (!ctx) throw new Error("useDesktopWallpaper must be used inside <WallpaperProvider>");
  return ctx;
}
