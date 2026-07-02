"use client";

import BootSequence from "./BootSequence";
import Desktop from "./Desktop";
import { WindowManagerProvider } from "./windowManager";

export default function Interactive() {
  return (
    <WindowManagerProvider>
      <Desktop />
      {/* Rendered on top of the desktop, unmounts itself after fade-out. */}
      <BootSequence />
    </WindowManagerProvider>
  );
}
