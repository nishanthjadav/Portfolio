"use client";

import Desktop from "./Desktop";
import { WindowManagerProvider } from "./windowManager";

export default function Interactive() {
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}
