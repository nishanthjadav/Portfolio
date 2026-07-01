"use client";

import { findByPath } from "../fileSystem";

export default function ImageViewer({ payload }: { payload: unknown }) {
  const path = typeof payload === "object" && payload && "path" in payload ? String((payload as { path: unknown }).path) : null;
  const node = path ? findByPath(path) : null;

  if (!node || node.type !== "image") {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-600 text-[11px]">
        Image not found.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-2" style={{ background: "#2a2a2a" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={node.src}
        alt={node.name}
        className="max-w-full max-h-full object-contain"
        style={{ boxShadow: "0 0 12px rgba(0,0,0,0.6)" }}
      />
    </div>
  );
}
