"use client";

import { useEffect, useRef, useState } from "react";

type EmailEntry = {
  label: string;
  hint: string;
  address: string;
};

const EMAILS: EmailEntry[] = [
  { label: "Personal", hint: "Gmail", address: "nishanthjadav@gmail.com" },
  { label: "School", hint: "Villanova", address: "njadav@villanova.edu" },
];

/**
 * "Email ▾" chip that reveals a small dropdown with both a personal and
 * school address. Kept as a self-contained client component so the rest of
 * the portfolio page can stay a server component.
 *
 * Behaviour:
 *   - Click the chip: toggle the panel.
 *   - Click an address: opens `mailto:` in a new tab (some browsers just
 *     hand off to the OS default), and closes the panel.
 *   - Click outside / press Escape: closes the panel.
 *   - Keyboard: the chip is a normal <button>, the addresses are normal <a>
 *     tags. Native tab order handles focus flow.
 */
export default function EmailDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="hover:text-muted transition-colors inline-flex items-center gap-1"
      >
        {/*
          Underline only the word — not the ▾ arrow. Wrapping the label in
          its own span keeps `text-decoration` scoped to the text, so the
          chevron reads as an affordance next to the link rather than part
          of the underlined phrase.
        */}
        <span className="underline underline-offset-4">Email</span>
        <span
          aria-hidden="true"
          className="transition-transform no-underline"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", fontSize: "0.7em" }}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute z-30 mt-2 min-w-[240px] rounded-xl border border-hair bg-paper shadow-[0_18px_45px_rgba(29,44,42,0.12)] p-1"
          // Center the dropdown under the chip so it looks anchored, not
          // orphan-aligned to a corner.
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          {EMAILS.map((e) => (
            <a
              key={e.address}
              href={`mailto:${e.address}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-baseline justify-between gap-4 px-3 py-2 rounded-lg hover:bg-accent-soft transition-colors text-left"
            >
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{e.label}</span>
                <span className="text-xs text-muted">{e.address}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted">
                {e.hint}
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
