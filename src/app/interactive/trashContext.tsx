"use client";

import { createContext, useContext, type ReactNode } from "react";

export type TrashedItem = {
  id: string;
  label: string;
  // React key + icon renderer. We store the icon element itself so restore
  // brings back the same visual, but the parent still owns identity via `id`.
  icon: ReactNode;
};

type TrashContextValue = {
  items: TrashedItem[];
  /** Remove one item from the trash and put it back on the desktop. */
  restore: (id: string) => void;
};

const TrashContext = createContext<TrashContextValue | null>(null);

export function TrashProvider({
  items,
  restore,
  children,
}: TrashContextValue & { children: ReactNode }) {
  return (
    <TrashContext.Provider value={{ items, restore }}>{children}</TrashContext.Provider>
  );
}

export function useTrash() {
  const ctx = useContext(TrashContext);
  if (!ctx) throw new Error("useTrash must be used inside <TrashProvider>");
  return ctx;
}
