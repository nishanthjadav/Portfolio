"use client";

import { findByPath } from "../fileSystem";

/**
 * PDF viewer window. Payload = { path: string } pointing at a PDF node in the
 * filesystem. Renders the file via <object>, with an <iframe> fallback for
 * older browsers, plus a plain-anchor fallback if neither can display it.
 */
export default function PdfViewer({ payload }: { payload: unknown }) {
  const path = typeof payload === "object" && payload && "path" in payload
    ? String((payload as { path: unknown }).path)
    : null;
  const node = path ? findByPath(path) : null;

  if (!node || node.type !== "pdf") {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-600 text-[11px]">
        PDF not found.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#2a2a2a" }}>
      {/* Thin faux toolbar so the window doesn't feel like a raw viewer */}
      <div
        className="flex items-center justify-between gap-3 px-2 h-[22px] border-b"
        style={{ borderColor: "#a7a7a7", background: "#f0f0f0", fontSize: 11 }}
      >
        <div className="flex items-center gap-3">
          {["File", "View", "Help"].map((label) => (
            <span key={label} className="cursor-default" style={{ color: "#111" }}>
              <span className="underline">{label[0]}</span>
              {label.slice(1)}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={node.src}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#0b48b6", textDecoration: "underline" }}
          >
            Open in new tab
          </a>
          <a
            href={node.src}
            download
            style={{ color: "#0b48b6", textDecoration: "underline" }}
          >
            Download
          </a>
        </div>
      </div>

      {/*
        <object> is the most reliable embed across browsers; on the rare
        Safari/mobile combo where it fails, the inner fallback renders a
        link so the resume is never inaccessible.
      */}
      <div className="flex-1 min-h-0">
        <object
          data={`${node.src}#view=FitH&toolbar=1`}
          type="application/pdf"
          className="w-full h-full"
          aria-label={node.name}
        >
          <iframe
            src={node.src}
            title={node.name}
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </object>
      </div>
    </div>
  );
}
