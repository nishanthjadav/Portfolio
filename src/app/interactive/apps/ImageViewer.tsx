"use client";

import Image from "next/image";

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
      <Image
        src={node.src}
        alt={node.name}
        width={1600}
        height={1200}
        quality={85}
        sizes="(max-width: 768px) 100vw, 900px"
        className="w-auto h-auto max-w-full max-h-full object-contain"
        style={{ boxShadow: "0 0 12px rgba(0,0,0,0.6)" }}
      />
    </div>
  );
}
