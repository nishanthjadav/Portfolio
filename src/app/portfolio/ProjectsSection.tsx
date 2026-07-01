"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MediaItem = {
  src: string;
  alt: string;
};

type Project = {
  name: string;
  year: string;
  description: string;
  features?: string[];
  media?: MediaItem[];
  links: Array<{ label: string; href: string }>;
};

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const close = useCallback(() => setPreview(null), []);

  // Esc closes the preview; while open, lock body scroll.
  useEffect(() => {
    if (!preview) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [preview, close]);

  return (
    <>
      <ul className="mt-6">
        {projects.map((project) => (
          <li key={project.name} className="py-6 border-t border-hair">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <div className="flex items-baseline flex-wrap gap-x-3">
                <h3 className="text-[1.1rem] font-medium tracking-[-0.04em]">{project.name}</h3>
                <span className="text-[0.82rem] text-muted">{project.year}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 text-sm text-muted">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-accent decoration-2 underline-offset-4 hover:text-ink transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <p className="text-[1.04rem] leading-relaxed max-w-[44rem] mt-3">{project.description}</p>
            {project.features && project.features.length > 0 ? (
              <ul className="mt-3 ml-5 grid gap-1.5 text-[1.04rem] text-muted list-disc marker:text-muted">
                {project.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            ) : null}
            {project.media && project.media.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {project.media.map((m) => (
                  <button
                    key={m.src}
                    type="button"
                    onClick={() => setPreview(m)}
                    aria-label={`Open ${m.alt}`}
                    className="group w-[220px] aspect-[4/3] rounded-2xl overflow-hidden border border-hair bg-[#d9d0c3] shadow-[0_10px_25px_rgba(47,79,77,0.08)] hover:shadow-[0_16px_35px_rgba(47,79,77,0.18)] transition-shadow cursor-zoom-in"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.src}
                      alt={m.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {preview ? <PreviewOverlay item={preview} onClose={close} /> : null}
    </>
  );
}

function PreviewOverlay({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center text-xl leading-none"
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={item.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[92vw] max-h-[88vh] rounded-lg shadow-2xl object-contain cursor-default"
      />
    </div>,
    document.body
  );
}
