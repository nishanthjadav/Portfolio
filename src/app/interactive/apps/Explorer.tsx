"use client";

import { findByPath, ROOT, type FSNode } from "../fileSystem";
import { useWindowManager } from "../windowManager";

/**
 * Explorer window. Payload = { path: string } pointing at a folder. If missing
 * or invalid, we default to ROOT (the "C:" desktop folder).
 */
export default function Explorer({ payload }: { payload: unknown }) {
  const { dispatch } = useWindowManager();
  const path = typeof payload === "object" && payload && "path" in payload ? String((payload as { path: unknown }).path) : ROOT.path;
  const node = findByPath(path) ?? ROOT;
  const folder = node.type === "folder" ? node : ROOT;

  const openNode = (child: FSNode) => {
    if (child.type === "folder") {
      dispatch({ type: "OPEN", appId: "explorer", title: child.name, payload: { path: child.path } });
    } else if (child.type === "text") {
      dispatch({ type: "OPEN", appId: "notepad", title: child.name, payload: { path: child.path } });
    } else if (child.type === "shortcut") {
      // Shortcuts leave the OS entirely — open the external URL in a new tab.
      globalThis.open(child.href, "_blank", "noopener,noreferrer");
    } else {
      dispatch({ type: "OPEN", appId: "image-viewer", title: child.name, payload: { path: child.path } });
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Address bar */}
      <div
        className="flex items-center gap-2 px-2 h-[24px] border-b"
        style={{ borderColor: "#a7a7a7", background: "#ece9d8", fontSize: 11 }}
      >
        <span className="text-[10px] text-gray-700">Address</span>
        <div
          className="flex-1 px-1 h-[18px] flex items-center bg-white"
          style={{ border: "1px solid #7f9db9", fontSize: 11 }}
        >
          {folder.path}
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-auto p-3">
        {folder.children.length === 0 ? (
          <div className="text-gray-500 text-[11px] italic">This folder is empty.</div>
        ) : (
          <ul className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
            {folder.children.map((child) => (
              <li key={child.path}>
                <button
                  type="button"
                  onDoubleClick={() => openNode(child)}
                  className="w-full flex flex-col items-center gap-1 p-1 rounded hover:bg-[#316ac5]/20 focus:bg-[#316ac5]/30 outline-none"
                  title={`Double-click to open ${child.name}`}
                >
                  <FSIcon node={child} />
                  <span
                    className="text-center break-words leading-tight max-w-[80px]"
                    style={{ fontSize: 11, color: "#111" }}
                  >
                    {child.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status bar */}
      <div
        className="px-2 h-[20px] flex items-center text-[10px] text-gray-700 border-t"
        style={{ background: "#ece9d8", borderColor: "#a7a7a7" }}
      >
        {folder.children.length} object{folder.children.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function FSIcon({ node }: { node: FSNode }) {
  if (node.type === "folder") return <FolderIcon />;
  if (node.type === "image") return <ImagePreviewIcon src={node.src} />;
  if (node.type === "shortcut") return <ShortcutIcon />;
  return <TextIcon />;
}

function FolderIcon() {
  return (
    <svg width="40" height="34" viewBox="0 0 40 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6 h12 l3 3 h21 v22 H2z" fill="#f2c14e" stroke="#8a6a12" />
      <path d="M2 10 h36 v20 H2z" fill="#ffd664" stroke="#8a6a12" />
    </svg>
  );
}

/**
 * External-link shortcut icon: a small globe with the classic "shortcut arrow"
 * badge in the bottom-left corner — the same badge Windows uses on .lnk files.
 */
function ShortcutIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="18" r="13" fill="#e6f0fb" stroke="#1a4f8a" strokeWidth="1.2" />
      {/* Meridians + equator */}
      <ellipse cx="20" cy="18" rx="6" ry="13" fill="none" stroke="#1a4f8a" strokeWidth="1" />
      <line x1="7" y1="18" x2="33" y2="18" stroke="#1a4f8a" strokeWidth="1" />
      <path d="M10 12 q10 6 20 0" fill="none" stroke="#1a4f8a" strokeWidth="0.8" />
      <path d="M10 24 q10 -6 20 0" fill="none" stroke="#1a4f8a" strokeWidth="0.8" />
      {/* Shortcut arrow badge */}
      <rect x="1" y="26" width="13" height="13" fill="#ffffff" stroke="#3a3a3a" strokeWidth="1" />
      <path d="M4 36 L4 30 L9 30 M4 30 L11 37" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2 h18 l6 6 v30 H4z" fill="#ffffff" stroke="#5a5a5a" />
      <path d="M22 2 v6 h6" fill="none" stroke="#5a5a5a" />
      {[12, 16, 20, 24, 28].map((y) => (
        <line key={y} x1="8" y1={y} x2="26" y2={y} stroke="#3b73b9" />
      ))}
    </svg>
  );
}

function ImagePreviewIcon({ src }: { src: string }) {
  return (
    <div
      className="w-[40px] h-[34px] overflow-hidden"
      style={{ border: "1px solid #7f9db9", background: "#fff" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-full h-full object-cover" />
    </div>
  );
}
